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

    // Always log to console as fallback
    console.error("[ErrorBoundary] Error caught:", logPayload);

    try {
      // Try to send to BetterStack with timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Logging timeout")), 5000);
      });

      await Promise.race([
        logtail.error("REACT_ERROR_BOUNDARY", logPayload),
        timeoutPromise,
      ]);

      await Promise.race([logtail.flush(), timeoutPromise]);

      console.log("[ErrorBoundary] Successfully sent error to BetterStack");
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
        localStorage.setItem("error_logs", JSON.stringify(errors.slice(-10))); // Keep last 10 errors
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
