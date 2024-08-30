import { useComputed, useSignal, useSignalEffect } from "@preact/signals";
import { useLocation } from "preact-iso";
import type { JSX } from "preact/jsx-runtime";
import { useEffect, useRef, useState } from "preact/hooks";
import { jsonFetch } from "../functions/http.ts";
import { youtubeThumbnail } from "../functions/youtube.ts";
import clsx from "clsx";
import { withViewTransition } from "../functions/dom.ts";

type SearchResultLink = {
  title: string;
  url: string;
};

type SearchResult = {
  url: string;
  title: string;
  desc: string;
  domain: string;
  author?: string;
  related?: SearchResultLink[];
};

export function Search() {
  const location = useLocation();
  const columns = useSignal<SearchResult[][]>([]);

  const onSearch = (q: string) => {
    const url = new URL(window.location.pathname, window.location.origin);
    url.searchParams.set("q", q);
    withViewTransition(() => location.route(url.toString()));
  };

  const query = location.query.q;
  const pushColumn = (column: SearchResult[]) => {
    columns.value = [...columns.value, column];
  };

  useEffect(() => {
    if (!query) {
      withViewTransition(() => {
        columns.value = [];
        document.body.classList.remove("has-results");
      });
      return;
    }

    const abortController = new AbortController();
    const signal = abortController.signal;

    jsonFetch<SearchResult[]>("/api/ddg", { query: { q: query }, signal }).then(
      pushColumn
    );
    jsonFetch<SearchResult[]>("/api/google", {
      query: { q: query },
      signal,
    }).then(pushColumn);

    document.body.classList.add("has-results");

    return () => abortController.abort();
  }, [query]);

  useSignalEffect(() => {
    console.log(columns.value);
  });

  return (
    <>
      <header class="search-top">
        <SearchForm onSearch={onSearch} defaultValue={query} />
      </header>
      <main class="search-main">
        {columns.value.map((column, index) => (
          <div class="search-column" key={index}>
            {column.map((result, k) => (
              <SearchResult result={result} key={k} />
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
};

function SearchForm({ onSearch, defaultValue }: Props) {
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
      isMultiline.value && "is-multiline"
    )
  );

  const handleKeyDown: JSX.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      onSubmit(e);
    }
  };

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
        <svg width="30" height="24" viewBox="0 0 25 25">
          <path
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-miterlimit="10"
            fill="none"
            d="M23.75 23.75l-9-9"
          ></path>
          <circle
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-miterlimit="10"
            cx="9"
            cy="9"
            r="7.75"
            fill="none"
          />
          <path fill="none" d="M25 25h-25v-25h25z"></path>
        </svg>
      </button>
    </form>
  );
}

function SearchResult({ result }: { result: SearchResult }) {
  const favicon = `https://external-content.duckduckgo.com/ip3/${result.domain}.ico`;
  const isYoutubeURL = result.url.startsWith("https://www.youtube.com/watch");
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
    const [, durationInWords] = result.desc.split(". ");
    thumbnail = youtubeThumbnail(result.url);
    description = durationInWords
      ?.replaceAll(" minutes", "min")
      .replaceAll(" et ", "")
      .replaceAll("secondes", "");
  }

  const hasRelated = result.related && result.related.length > 0;

  return (
    <div class={clsx("search-result", isYoutubeURL && "search-result--img")}>
      {thumbnail && (
        <img className="search-result__img" src={thumbnail} alt="" />
      )}
      <div>
        <a
          class="search-result__title"
          rel="noopener noreferrer"
          href={result.url}
          dangerouslySetInnerHTML={{ __html: result.title }}
        />
        <div class="search-result__url">
          <img src={favicon} alt="" />
          <span>{source}</span>
        </div>
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
      </div>
    </div>
  );
}
