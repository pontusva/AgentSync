import { useCallback } from "react";
import { logtail } from "../logtail/logtail";

export const useLogging = () => {
  const logError = useCallback(
    async (error: Error, context?: Record<string, any>) => {
      try {
        await logtail.error("REACT_ERROR", {
          dt: new Date().toISOString(),
          source: "react-app",
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
          },
          ...context,
        });
        await logtail.flush();
      } catch (loggingError) {
        console.error("Failed to log error:", loggingError);
        console.error("Original error:", error);
      }
    },
    []
  );

  const logInfo = useCallback(
    async (message: string, context?: Record<string, any>) => {
      try {
        await logtail.info(message, {
          dt: new Date().toISOString(),
          source: "react-app",
          ...context,
        });
        await logtail.flush();
      } catch (loggingError) {
        console.error("Failed to log info:", loggingError);
      }
    },
    []
  );

  return { logError, logInfo };
};
