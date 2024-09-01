import { Signal, useComputed, useSignal } from "@preact/signals";
import { useLocation } from "preact-iso";
import type { JSX } from "preact/jsx-runtime";
import { useEffect, useRef } from "preact/hooks";
import { youtubeThumbnail } from "../functions/youtube.ts";
import clsx from "clsx";
import { withViewTransition } from "../functions/dom.ts";
import { SearchIcon } from "../components/icons.tsx";
import { SearchResult, useSearchResults } from "../hooks/useSearchResults.tsx";
import { Timer } from "../components/Timer.tsx";
import { domainName } from "../functions/string.ts";

export function Search() {
  const location = useLocation();
  const { columns, query, isFetching, component } = useSearchResults(location);

  const onSearch = (q: string) => {
    const url = new URL(window.location.pathname, window.location.origin);
    url.searchParams.set("q", q);
    withViewTransition(() => location.route(url.toString()));
  };

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

type Props = {
  onSearch: (query: string) => void;
  defaultValue?: string;
  isLoading: Signal<boolean>;
};

function SearchForm({ onSearch, defaultValue, isLoading }: Props) {
  const isFocused = useSignal(false);
  const isMultiline = useSignal(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFocus = () => {
    isFocused.value = true;
  };

  const onBlur = () => {
    isFocused.value = false;
  };

  const onSubmit = (e: Event) => {
    e.preventDefault();
    onSearch(inputRef.current?.innerText ?? "");
  };

  const className = useComputed(() =>
    clsx(
      "search-form",
      isFocused.value && "is-focused",
      isMultiline.value && "is-multiline",
      isLoading.value && "is-loading",
    ),
  );

  // Submit on enter (since we use a contenteditable element, we need to handle it manually)
  const handleKeyDown: JSX.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      onSubmit(e);
    }
    if (e.shiftKey) {
      console.log("shift");
    }
  };

  // Detect multiline input to add a new class on the form
  const handleInput: JSX.GenericEventHandler<HTMLDivElement> = (e) => {
    isMultiline.value = e.currentTarget.innerText.includes("\n");
  };

  // Insert the right content inside the div
  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.innerHTML = defaultValue ?? "";
  }, []);

  return (
    <form action="#" className={className} onSubmit={onSubmit}>
      <div
        ref={inputRef}
        role="textbox"
        contentEditable
        autoFocus
        name="q"
        type="text"
        autoComplete="off"
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
      />
      <button type="submit">
        <SearchIcon />
      </button>
    </form>
  );
}

function SearchItem({ result }: { result: SearchResult }) {
  const favicon = `https://external-content.duckduckgo.com/ip3/${result.domain}.ico`;
  const isYoutubeURL = result.url.startsWith("https://www.youtube.com/watch");
  const siteName = result.siteName ?? domainName(result.url);
  let description = result.desc;
  let thumbnail: string | null = null;
  let source = result.url
    .replace("https://", "")
    .replace("www.", "")
    .replace(/\/$/, "");

  if (isYoutubeURL) {
    source = result.author
      ? result.author.replace("YouTube · ", "")
      : "YouTube";
    thumbnail = youtubeThumbnail(result.url);
  }

  const hasRelated = result.related && result.related.length > 0;

  return (
    <article
      class={clsx("search-result", isYoutubeURL && "search-result--img")}
    >
      {thumbnail && (
        <img className="search-result__img" src={thumbnail} alt="" />
      )}
      <div className="search-result__header">
        <div className="search-result__favicon">
          <img src={favicon} alt="" />
        </div>
        <div
          class="search-result__name"
        >{siteName}</div>
        <div class="search-result__url">{source}</div>
      </div>
      <a
        class="search-result__title"
        rel="noopener noreferrer"
        href={result.url}
        dangerouslySetInnerHTML={{ __html: result.title }}
      />
      <p
        class="search-result__desc"
        dangerouslySetInnerHTML={{ __html: description }}
      />
      {hasRelated && (
        <div class="search-result__related">
          {result.related!.map((link) => (
            <a rel="noopener noreferrer" href={link.url}>
              {link.title}
            </a>
          ))}
        </div>
      )}
    </article>
  );
}
