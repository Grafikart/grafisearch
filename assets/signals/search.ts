import { bangs } from "../middlewares/bangs.js";
import { calculator } from "../middlewares/calculator.js";
import { timer } from "../middlewares/timer";
import { uppercase } from "../middlewares/uppercase.js";
import { setPageTitle, withViewTransition } from "../functions/dom.ts";
import { createEffect, createSignal } from "solid-js";

/**
 * Check if the query match one of the middleware (short circuit the search)
 */
const matchMiddlewares = (q: string): boolean => {
  for (const middleware of [bangs, calculator, timer, uppercase]) {
    if (middleware(q)) {
      return true;
    }
  }
  return false;
};

const q = new URL(window.location.href).searchParams.get("q") ?? "";

const [search, setSearch] = createSignal({
  q: q,
  intercepted: !matchMiddlewares(q),
});

/**
 * Public API for interacting with the search
 **/
// Last submitted search query
export const searchQuery = () => search().q;
// Search query that needs a remote fetch (null if intercepted)
export const searchableQuery = () =>
  search().intercepted && search().q ? search().q : "";
// Trigger a new search
export const pushSearch = (q: string) => {
  if (q === search().q) {
    return;
  }

  // Multi line search goes into an IA conversation
  if (q.includes("\n")) {
    const url = new URL(
      "https://www.bing.com/search?showconv=1&sendquery=1&q=s",
    );
    url.searchParams.set("q", q);
    window.location.replace(url);
    return;
  }

  const url = new URL(window.location.href);
  q ? url.searchParams.set("q", q) : url.searchParams.delete("q");
  history.pushState(null, "", url.toString());
  setSearch({
    q,
    intercepted: !matchMiddlewares(q),
  });
};

createEffect(() => {
  setPageTitle(searchQuery());
});

createEffect(() => {
  if (searchableQuery()) {
    withViewTransition(() => document.body.classList.add("has-results"));
  } else {
    withViewTransition(() => document.body.classList.remove("has-results"));
  }
});

window.onpopstate = function () {
  const q = new URL(window.location.href).searchParams.get("q") ?? "";
  setSearch({
    q,
    intercepted: !matchMiddlewares(q),
  });
};
