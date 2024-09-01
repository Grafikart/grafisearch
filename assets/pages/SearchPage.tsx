import { useLocation } from "preact-iso";
import { withViewTransition } from "../functions/dom.ts";
import { useSearchResults } from "../hooks/useSearchResults.tsx";
import { Timer } from "../components/Timer.tsx";
import { SearchForm } from "../components/search/SearchForm.tsx";
import { SearchItem } from "../components/search/SearchItem.tsx";
import { SearchWallpaperButton } from "../components/search/SearchWallpaperButton.tsx";

export function SearchPage() {
  const location = useLocation();
  const { columns, query, isFetching, component } = useSearchResults(location);

  const onSearch = (q: string) => {
    const url = new URL(window.location.pathname, window.location.origin);
    url.searchParams.set("q", q);
    withViewTransition(() => location.route(url.toString()));
  };

  const showWallpaperSwitcher = !query;

  return (
    <>
      <header class="search-top">
        <SearchForm
          onSearch={onSearch}
          defaultValue={query}
          isLoading={isFetching}
        />
        {component.value}
        <Timer />
      </header>
      {showWallpaperSwitcher && <SearchWallpaperButton />}
      <main class="search-main">
        {columns.value.map((column, index) => (
          <div class="search-column" key={index}>
            {column.map((result, k) => (
              <SearchItem result={result} key={k} />
            ))}
          </div>
        ))}
      </main>
    </>
  );
}
