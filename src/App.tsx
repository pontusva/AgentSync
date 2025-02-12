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
  logtail.flush();
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
