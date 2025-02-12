// A component that will throw an error for testing purposes
import { useState } from "react";
import { logtail } from "../logtail/logtail";

export const TestError = () => {
  const [shouldThrow, setShouldThrow] = useState(false);

  const handleAsyncError = async () => {
    try {
      await Promise.reject(new Error("Test async error"));
    } catch (error) {
      logtail.error("ASYNC_ERROR", {
        dt: new Date().toISOString(),
        source: "TestError",
        type: "async_error",
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : undefined,
        },
      });
      logtail.flush();
    }
  };

  const handleGlobalError = () => {
    try {
      throw new Error("Test global error");
    } catch (error) {
      logtail.error("MANUAL_ERROR", {
        dt: new Date().toISOString(),
        source: "TestError",
        type: "global_error",
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : undefined,
        },
      });
      logtail.flush();
    }
  };

  // This one will still be caught by ErrorBoundary since it happens during render
  if (shouldThrow) {
    throw new Error("Test error from component");
  }

  return (
    <div className="flex flex-col gap-4">
      <button onClick={() => setShouldThrow(true)}>
        Throw Component Error
      </button>
      <button onClick={handleAsyncError}>Throw Async Error</button>
      <button onClick={handleGlobalError}>Throw Global Error</button>
    </div>
  );
};
