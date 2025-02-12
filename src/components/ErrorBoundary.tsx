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
    logtail.error("React Error Boundary caught an error", {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
    });

    logtail.flush();
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
    logtail.error("Global error caught", {
      error: {
        message: event.message,
        stack: event.error?.stack,
        name: event.error?.name,
      },
    });
    logtail.flush();
  };

  private handlePromiseRejection = (event: PromiseRejectionEvent) => {
    logtail.error("Unhandled Promise rejection", {
      error: {
        message: event.reason?.message || "Unknown promise rejection",
        stack: event.reason?.stack,
        name: event.reason?.name,
      },
    });
    logtail.flush();
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
