import { Component, ErrorInfo, ReactNode } from "react";
import { logtail } from "../logtail/logtail";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  private async sendErrorToLogtail(error: Error, errorInfo: ErrorInfo) {
    const logPayload = {
      dt: new Date().toISOString(),
      source: "ErrorBoundary",
      type: "component_error",
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
    };

    try {
      // Log the payload for debugging
      console.log("[ErrorBoundary] Attempting to send error:", logPayload);

      // Send to BetterStack with timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Logging timeout")), 5000);
      });

      // Send the error and wait for confirmation
      await Promise.race([
        logtail.error("REACT_COMPONENT_ERROR", logPayload).then(() => {
          console.log("[ErrorBoundary] Initial log sent");
        }),
        timeoutPromise,
      ]);

      // Explicitly flush and wait for confirmation
      await logtail.flush();
      console.log("[ErrorBoundary] Successfully flushed to BetterStack");
    } catch (loggingError) {
      console.error(
        "[ErrorBoundary] Failed to send to BetterStack:",
        loggingError
      );

      // Fallback: Send to localStorage
      try {
        const errors = JSON.parse(localStorage.getItem("error_logs") || "[]");
        errors.push({
          timestamp: new Date().toISOString(),
          ...logPayload,
        });
        localStorage.setItem("error_logs", JSON.stringify(errors.slice(-10)));
      } catch (storageError) {
        console.error(
          "[ErrorBoundary] Failed to store error in localStorage:",
          storageError
        );
      }
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.sendErrorToLogtail(error, errorInfo).catch(console.error); // Final catch-all
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary p-4 border border-red-500 rounded">
          <h1 className="text-xl font-bold text-red-500">
            Something went wrong
          </h1>
          <p className="mt-2">
            The error has been logged and we'll look into it.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
