import { useComputed, useSignal } from "@preact/signals";
import { ButtonIcon } from "../ButtonIcon.tsx";
import { WallpaperIcon } from "../icons.tsx";
import { jsonFetch } from "../../functions/http.ts";
import clsx from "clsx";

/**
 * Toggle button that switch the wallpaper
 */
export function SearchWallpaperButton() {
  const isLoading = useSignal(false);
  const toggleWallpaper = () => {
    isLoading.value = true;
    jsonFetch<{wallpaper: string}>("/api/wallpaper", {method: "POST"}).then(({wallpaper}) => document.body.style.backgroundImage = `url(${wallpaper})`).catch(e => alert(e.message)).finally(() => isLoading.value = false);
  };

  const className = useComputed(() => clsx("search-wallpaper", isLoading.value && "is-loading"));
  
  return (
    <ButtonIcon onClick={toggleWallpaper} className={className.value}>
      <WallpaperIcon />
    </ButtonIcon>
  );
}