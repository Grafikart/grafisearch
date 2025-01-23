import { useComputed, useSignal } from "@preact/signals";
import { ButtonIcon } from "../ButtonIcon.tsx";
import { WallpaperIcon } from "../icons.tsx";
import { jsonFetch } from "../../functions/http.ts";
import clsx from "clsx";

const storageKey = "grafisearch-wallpaper";
const baseWallpaper = "/images/wallpaper.jpg";

type WallpaperState = {
  time: number;
  url: string;
};

// Set the wallpaper from the local storage
const storageValue = localStorage.getItem(storageKey);
const state = storageValue
  ? (JSON.parse(storageValue) as WallpaperState)
  : { time: 0, url: baseWallpaper };
document.body.style.backgroundImage = `url(${state.url})`;

// If the wallpaper is stale, fetch a new one
const today = new Date();
today.setHours(0, 0, 0, 0);
if (today.getDate() !== new Date(state.time).getDate()) {
  applyBingWallpaper();
}

// Reset the wallpaper to the base wallpaper
function resetWallpaper() {
  state.url = baseWallpaper;
  state.time = today.getTime();
  localStorage.setItem(storageKey, JSON.stringify(state));
  document.body.style.backgroundImage = `url(${baseWallpaper})`;
}

async function applyBingWallpaper() {
  try {
    const { wallpaper } = await jsonFetch<{ wallpaper: string }>(
      "/api/wallpaper"
    );
    state.url = wallpaper;
    state.time = today.getTime();
    localStorage.setItem(storageKey, JSON.stringify(state));
    document.body.style.backgroundImage = `url(${wallpaper})`;
  } catch (e) {
    console.error(e);
  }
}

/**
 * Toggle button that switch the wallpaper
 */
export function SearchWallpaperButton() {
  const isLoading = useSignal(false);
  const toggleWallpaper = () => {
    if (state.url === baseWallpaper) {
      isLoading.value = true;
      applyBingWallpaper().finally(() => (isLoading.value = false));
    } else {
      resetWallpaper();
    }
  };

  const className = useComputed(() =>
    clsx("search-wallpaper", isLoading.value && "is-loading")
  );

  return (
    <ButtonIcon onClick={toggleWallpaper} className={className.value}>
      <WallpaperIcon />
    </ButtonIcon>
  );
}
