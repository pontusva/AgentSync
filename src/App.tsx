import "./App.css";
import Dashboard from "@/components/dashboard";
import { logtail } from "@/logtail/logtail";

function App() {
  logtail.error("Something bad happend.");
  logtail.info("Log message with structured data.", {
    item: "Orange Soda",
    price: 100.0,
  });

  // Ensure that all logs are sent to Logtail
  logtail.flush();

  return (
    <div className="container">
      <Dashboard />
    </div>
  );
}

export default App;
