import "./App.css";
import Dashboard from "@/components/dashboard";
import { logtail } from "./logtail/logtail";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { TestError } from "./components/TestError";

function App() {
  logtail.error("TEST_ERROR", {
    dt: new Date().toISOString(),
    source: "App",
    type: "test_error",
  });

  logtail.debug("DEBUG", {
    dt: new Date().toISOString(),
    source: "App",
    type: "test_error_2",
  });
  logtail.flush();
  // Test the connection
  logtail
    .info("Logtail initialized", {
      dt: new Date().toISOString(),
      source: "init",
    })
    .then(() => {
      console.log("Successfully connected to BetterStack");
    })
    .catch((error) => {
      console.error("Failed to connect to BetterStack:", error);
    });
  return (
    <ErrorBoundary>
      <div className="container">
        <h1>Error Testing</h1>
        <TestError />
        <Dashboard />
      </div>
    </ErrorBoundary>
  );
}

export default App;
