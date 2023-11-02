import { useSignal, useSignalEffect } from "@preact/signals";
import { SearchResult } from "../types.ts";
import { searchableQuery } from "../signals/search.ts";
import { youtubeThumbnail } from "../youtube.ts";
import clsx from "clsx";
import { LogButton } from "./LogButton.tsx";

type Props = {
  source: string;
};

export function SearchResults({ source }: Props) {
  const data = useSignal([] as SearchResult[]);
  const isFetching = useSignal(false);

  useSignalEffect(() => {
    if (!searchableQuery.value) {
      return;
    }
    const url = new URL(source, window.location.origin);
    url.searchParams.set("q", searchableQuery.value);
    fetch(url)
      .then((r) => r.json() as Promise<SearchResult[]>)
      .then(redirectIfExclamationMark(searchableQuery.value))
      .then((r) => {
        data.value = r;
        isFetching.value = false;
      });
  });

  return (
    <>
      {data.value.map((r) => (
        <Item result={r} key={r.url} />
      ))}
    </>
  );
}

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

  const hasRelated = r.related && r.related.length > 0;
  return (
    <div class={clsx("result", isYoutubeURL && "result--img")}>
      {thumbnail && <img className="result__img" src={thumbnail} alt="" />}
      <div>
        <a class="result__title" rel="noopener noreferrer" href={r.url}>
          {r.title}
        </a>
        <div class="result__url">
          <img src={favicon} alt="" />
          <span>{source}</span>
        </div>
        <p
          class="result__desc"
          dangerouslySetInnerHTML={{ __html: description }}
        />
        {hasRelated && (
          <div class="result__related">
            {r.related!.map((link) => (
              <a rel="noopener noreferrer" href={link.url}>
                {link.title}
              </a>
            ))}
          </div>
        )}
      </div>
      <LogButton url={r.url} found={!source.includes("google")} />
    </div>
  );
}

const redirectIfExclamationMark =
  (q: string) =>
  (r: SearchResult[]): SearchResult[] => {
    if (q.endsWith("!") && r[0] !== undefined) {
      window.location.href = r[0].url;
      throw new Error("Redirecting");
    }
    return r;
  };
