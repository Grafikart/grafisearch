import { SearchResult } from "../types.ts";
import { searchableQuery } from "../signals/search.ts";
import { youtubeThumbnail } from "../youtube.ts";
import { LogButton } from "./LogButton.tsx";
import { useSignalClass } from "../hooks/useSignalClass.ts";
import { customElement, noShadowDOM } from "solid-element";
import { createEffect, createSignal, For, Show } from "solid-js";

const redirectIfExclamationMark =
  (q: string) =>
  (r: SearchResult[]): SearchResult[] => {
    if (q.endsWith("!") && r[0] !== undefined) {
      window.location.href = r[0].url;
      throw new Error("Redirecting");
    }
    return r;
  };

customElement("search-results", { source: "" }, ({ source }, { element }) => {
  if (!(element instanceof HTMLElement)) {
    return;
  }
  noShadowDOM();
  const [data, setData] = createSignal([] as SearchResult[]);
  const [isFetching, setFetching] = createSignal(false);

  createEffect(() => {
    if (!searchableQuery()) {
      return;
    }
    setFetching(true);
    const url = new URL(source, window.location.origin);
    url.searchParams.set("q", searchableQuery());
    fetch(url)
      .then((r) => r.json() as Promise<SearchResult[]>)
      .then(redirectIfExclamationMark(searchableQuery()))
      .then((r) => {
        setData(r);
      })
      .finally(() => {
        setFetching(false);
      });
  });

  useSignalClass(element, "is-fetching", isFetching);

  return <For each={data()}>{(row) => <Item result={row} />}</For>;
});

function Item({ result: r }: { result: SearchResult }) {
  const favicon = `https://external-content.duckduckgo.com/ip3/${r.domain}.ico`;
  const isYoutubeURL = r.url.startsWith("https://www.youtube.com/watch");
  let description = r.desc;
  let thumbnail: string | null = null;
  let source = r.url
    .replace("https://", "")
    .replace("www.", "")
    .replace(/\/$/, "");

  if (isYoutubeURL) {
    source = r.author ? r.author.replace("YouTube · ", "") : "YouTube";
    const [, durationInWords] = r.desc.split(". ");
    thumbnail = youtubeThumbnail(r.url);
    description = durationInWords
      ?.replaceAll(" minutes", "min")
      .replaceAll(" et ", "")
      .replaceAll("secondes", "");
  }

  return (
    <div class="result" classList={{ "result--img": isYoutubeURL }}>
      {thumbnail && <img class="result__img" src={thumbnail} alt="" />}
      <div>
        <a
          class="result__title"
          rel="noopener noreferrer"
          href={r.url}
          innerHTML={r.title}
        />
        <div class="result__url">
          <img src={favicon} alt="" />
          <span>{source}</span>
        </div>
        <p class="result__desc" innerHTML={description} />
        <Show when={r.related && r.related.length > 0}>
          <div class="result__related">
            <For each={r.related}>
              {(link) => (
                <a rel="noopener noreferrer" href={link.url}>
                  {link.title}
                </a>
              )}
            </For>
          </div>
        </Show>
      </div>
      <LogButton url={r.url} found={!source.includes("google")} />
    </div>
  );
}
