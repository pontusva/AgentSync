import { useCallback } from "react";
import { logtail } from "../logtail/logtail";

export const useLogging = () => {
  // Create reusable timeout promise
  const createTimeoutPromise = (ms: number = 5000) => {
    let timeoutId: NodeJS.Timeout;
    const promise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error("Logging timeout")), ms);
    });
    return { promise, timeoutId };
  };

  const logError = useCallback(
    async (error: Error, context?: Record<string, any>) => {
      const logPayload = {
        dt: new Date().toISOString(),
        source: "react-app",
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
        ...context,
      };

      try {
        const { promise: timeoutPromise, timeoutId } = createTimeoutPromise();

        try {
          // Send log with timeout
          await Promise.race([
            logtail.error("REACT_APP_ERROR", logPayload),
            timeoutPromise,
          ]);

          // Ensure flush completes
          await Promise.race([logtail.flush(), timeoutPromise]);

          console.log("[Logging] Successfully sent error to BetterStack");
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (loggingError) {
        console.error("[Logging] Failed to send to BetterStack:", loggingError);
        // Store in localStorage as backup
        try {
          const errors = JSON.parse(localStorage.getItem("error_logs") || "[]");
          errors.push({
            timestamp: new Date().toISOString(),
            ...logPayload,
          });
          localStorage.setItem("error_logs", JSON.stringify(errors.slice(-10)));
        } catch (storageError) {
          console.error(
            "[Logging] Failed to store in localStorage:",
            storageError
          );
        }
      }
    },
    []
  );

  const logInfo = useCallback(
    async (message: string, context?: Record<string, any>) => {
      const logPayload = {
        dt: new Date().toISOString(),
        source: "react-app",
        message,
        ...context,
      };

      try {
        const { promise: timeoutPromise, timeoutId } = createTimeoutPromise();

        await Promise.race([logtail.info(message, logPayload), timeoutPromise]);

        await Promise.race([logtail.flush(), timeoutPromise]);
      } catch (loggingError) {
        console.error("[Logging] Failed to log info:", loggingError);
      }
    },
    []
  );

  return { logError, logInfo };
};
