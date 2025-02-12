// A component that will throw an error for testing purposes
import { useState } from "react";
export const TestError = () => {
  const [shouldThrow, setShouldThrow] = useState(false);

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
          // Test async error
          Promise.reject(new Error("Test async error"));
        }}
      >
        Throw Async Error
      </button>
      <button
        onClick={() => {
          // Test regular error
          throw new Error("Test global error");
        }}
      >
        Throw Global Error
      </button>
    </div>
  );
};
