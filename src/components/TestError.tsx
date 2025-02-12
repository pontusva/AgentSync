// A component that will throw an error for testing purposes
import { useState } from "react";
import { useLogging } from "../hooks/useLogging";
import { logtail } from "@/logtail/logtail";

export const TestError = () => {
  const [shouldThrow, setShouldThrow] = useState(false);
  const { logError } = useLogging();

  const handleAsyncError = async () => {
    try {
      await Promise.reject(new Error("Test async error"));
    } catch (error) {
      if (error instanceof Error) {
        await logError(error, {
          type: "async_error",
          source: "TestError",
        });
      }
    }
  };

  const handleGlobalError = () => {
    try {
      throw new Error("Test global error");
    } catch (error) {
      if (error instanceof Error) {
        logError(error, {
          type: "global_error",
          source: "TestError",
        });
      }
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
      <button
        onClick={() => {
          logtail.debug("DEBUG", {
            dt: new Date().toISOString(),
            source: "App",
            type: "test_error_2",
          });
          logtail.flush();
        }}
      >
        THIS SHOULD WORK
      </button>
      <button onClick={handleGlobalError}>Throw Global Error</button>
    </div>
  );
};
