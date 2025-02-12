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

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Attempting to log error to BetterStack:", error);

    try {
      logtail.error("REACT_ERROR_BOUNDARY", {
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
      });

      // Immediate flush to ensure delivery
      logtail.flush().catch((flushError) => {
        console.error("Failed to flush logs to BetterStack:", flushError);
        console.error("Original error:", {
          error,
          errorInfo,
        });
      });
    } catch (loggingError) {
      console.error("Failed to log to BetterStack:", loggingError);
      console.error("Original error:", {
        error,
        errorInfo,
      });
    }
  }

  componentDidMount() {
    window.addEventListener("error", this.handleGlobalError);
    window.addEventListener("unhandledrejection", this.handlePromiseRejection);
  }

  componentWillUnmount() {
    window.removeEventListener("error", this.handleGlobalError);
    window.removeEventListener(
      "unhandledrejection",
      this.handlePromiseRejection
    );
  }

  private handleGlobalError = (event: ErrorEvent) => {
    try {
      logtail.error("GLOBAL_ERROR", {
        dt: new Date().toISOString(),
        source: "ErrorBoundary",
        type: "global_error",
        error: {
          message: event.message,
          stack: event.error?.stack,
          name: event.error?.name,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
      logtail.flush();
    } catch (loggingError) {
      console.error("Failed to log global error to BetterStack:", loggingError);
      console.error("Original error:", event);
    }
  };

  private handlePromiseRejection = (event: PromiseRejectionEvent) => {
    try {
      logtail.error("UNHANDLED_PROMISE_REJECTION", {
        dt: new Date().toISOString(),
        source: "ErrorBoundary",
        type: "promise_rejection",
        error: {
          message: event.reason?.message || "Unknown promise rejection",
          stack: event.reason?.stack,
          name: event.reason?.name,
        },
      });
      logtail.flush();
    } catch (loggingError) {
      console.error(
        "Failed to log promise rejection to BetterStack:",
        loggingError
      );
      console.error("Original rejection:", event);
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>Sorry.. there was an error</h1>
        </div>
      );
    }

    return this.props.children;
  }
}
