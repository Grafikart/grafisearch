import { SearchResult } from "../../hooks/useSearchResults.tsx";
import { domainName } from "../../functions/string.ts";
import { youtubeThumbnail } from "../../functions/youtube.ts";
import clsx from "clsx";

export function SearchItem({ result }: { result: SearchResult }) {
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
        <div class="search-result__name">{siteName}</div>
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
