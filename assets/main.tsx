import "./css/main.css";
import { LocationProvider, ErrorBoundary, Router, Route } from "preact-iso";

import { SearchPage } from "./pages/SearchPage.tsx";
import { render } from "preact";
import { NotFound } from "./pages/NotFound.tsx";

const App = () => (
  <ErrorBoundary>
    <LocationProvider>
      <Router>
        <Route path="/" component={SearchPage} />
        <Route path="/404" component={NotFound} />
      </Router>
    </LocationProvider>
  </ErrorBoundary>
);

const searchElement = document.getElementById("search");
if (searchElement) {
  render(<App />, searchElement);
}
