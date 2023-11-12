import { searchQuery } from "../signals/search";

type Props = {
  url: string;
  // Result was found on the alternative search engine
  found: boolean;
};

export function LogButton({ url, found }: Props) {
  const handleClick = () => {
    navigator.sendBeacon(
      "/api/log",
      JSON.stringify({
        q: searchQuery(),
        found: found,
        googleFound:
          !found &&
          document.querySelector(`#google a[href^='${url}']`) !== null,
        url,
      }),
    );
  };

  return (
    <a
      rel="noopener noreferrer"
      href={url}
      class="btn-icon results-confirm"
      onClick={handleClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
        <path d="m9 12 2 2 4-4"></path>
      </svg>
    </a>
  );
}
