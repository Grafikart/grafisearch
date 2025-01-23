import { useSignal } from "@preact/signals";
import { type LocationHook } from "preact-iso";
import { useEffect } from "preact/hooks";
import { withViewTransition } from "../functions/dom.ts";
import { jsonFetch } from "../functions/http.ts";
import { type ComponentChild } from "preact";
import { matchMiddlewares } from "../functions/middleware/middlewares.tsx";

type SearchResultLink = {
  title: string;
  url: string;
};

export type SearchResult = {
  url: string;
  title: string;
  desc: string;
  domain: string;
  author?: string;
  related?: SearchResultLink[];
  siteName?: string;
};

const baseTitle = "GrafiSearch";

export function useSearchResults(location: LocationHook) {
  const columns = useSignal<SearchResult[][]>([]);
  const query = location.query.q;
  const isFetching = useSignal(false);
  const component = useSignal<ComponentChild>(null);

  // Update title according to query
  useEffect(() => {
    document.title = query ? `${query} - ${baseTitle}` : baseTitle;
  }, [query]);

  const pushColumn = (column: SearchResult[]) => {
    withViewTransition(() => {
      columns.value = [...columns.value, column];
    });
  };

  useEffect(() => {
    if (!query) {
      withViewTransition(() => {
        columns.value = [];
        document.body.classList.remove("has-results");
      });
      return;
    }
    document.body.classList.add("has-results");

    // Check if a smart function or bang intercepts the search
    component.value = matchMiddlewares(query);
    if (component.value) {
      return;
    }

    columns.value = [];
    const abortController = new AbortController();
    const signal = abortController.signal;
    isFetching.value = true;

    Promise.allSettled([
      jsonFetch<SearchResult[]>("/api/ddg", {
        query: { q: query },
        signal,
      }).then(pushColumn),
      jsonFetch<SearchResult[]>("/api/brave", {
        query: { q: query },
        signal,
      }).then(pushColumn),
    ]).then(() => {
      isFetching.value = false;
    });

    return () => abortController.abort();
  }, [query]);

  return { columns, query, isFetching, component };
}
