import { useSignal } from "@preact/signals";
import { type ComponentChild } from "preact";
import { type LocationHook } from "preact-iso";
import { useEffect } from "preact/hooks";
import { withViewTransition } from "../functions/dom.ts";
import { jsonFetch } from "../functions/http.ts";
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

const baseTitle = "Research";

export type SearchColumn = {
  engine: string;
  results: SearchResult[];
};

export function useSearchResults(location: LocationHook) {
  const columns = useSignal<SearchColumn[]>([]);
  const query = location.query.q;
  const engine = location.query.engine;
  const isFetching = useSignal(false);
  const component = useSignal<ComponentChild>(null);

  // Update title according to query
  useEffect(() => {
    document.title = query ? `${query} - ${baseTitle}` : baseTitle;
  }, [query]);

  const pushColumn = (engineName: string, results: SearchResult[]) => {
    withViewTransition(() => {
      columns.value = [...columns.value, { engine: engineName, results }];
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

    // Determine which engines to use based on query parameter
    const engines = engine === "youtube" ? ["youtube"] : ["ddg", "startpage"];
    const promises = engines.map(eng => {
      const endpoint = `/api/${eng}`;
      return jsonFetch<SearchResult[]>(endpoint, {
        query: { q: query },
        signal,
      }).then(results => pushColumn(eng, results));
    });

    Promise.allSettled(promises).then(() => {
      isFetching.value = false;
    });

    return () => abortController.abort();
  }, [query]);

  return { columns, query, isFetching, component };
}
