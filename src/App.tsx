import "./App.css";
import Dashboard from "@/components/dashboard";

import { ErrorBoundary } from "./components/ErrorBoundary";
import { TestError } from "./components/TestError";

function App() {
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
