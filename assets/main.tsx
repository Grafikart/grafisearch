import "./css/main.css";
import { LocationProvider, ErrorBoundary, Router, Route } from "preact-iso";

import { Search } from "./pages/Search.tsx";
import { render } from "preact";

const App = () => (
  <ErrorBoundary>
    <LocationProvider>
      <Router>
        <Route path="/" component={Search} />
        <Route path="/stats" component={Search} />
      </Router>
    </LocationProvider>
  </ErrorBoundary>
);

const searchElement = document.getElementById("search");
if (searchElement) {
  render(<App />, searchElement);
}
