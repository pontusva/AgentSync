import { logtail } from "../logtail/logtail";

export function setupGlobalErrorHandlers() {
  window.onerror = (message, source, lineno, colno, error) => {
    logtail.error("Global error caught", {
      message,
      source,
      lineno,
      colno,
      error: error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        : null,
    });
  };

  window.onunhandledrejection = (event) => {
    logtail.error("Unhandled Promise rejection", {
      reason: event.reason,
    });
  };
}
