import { useSignal } from "@preact/signals";
import type { App } from "./types.ts";
import { getFaviconUrl } from "./store.ts";
import { AppContextMenu } from "./AppContextMenu.tsx";

interface Props {
  app: App;
}

export function AppItem({ app }: Props) {
  const showMenu = useSignal(false);
  const menuPos = useSignal({ x: 0, y: 0 });

  const faviconUrl = getFaviconUrl(app.url);

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    menuPos.value = { x: e.clientX, y: e.clientY };
    showMenu.value = true;
  };

  return (
    <>
      <a href={app.url} class="app-item" onContextMenu={handleContextMenu}>
        <img src={faviconUrl} alt="" class="app-favicon" loading="lazy" />
        <span class="app-name">{app.name}</span>
      </a>
      {showMenu.value && (
        <AppContextMenu
          app={app}
          position={menuPos.value}
          onClose={() => (showMenu.value = false)}
        />
      )}
    </>
  );
}
