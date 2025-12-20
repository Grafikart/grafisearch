import { useSignal } from "@preact/signals";
import type { App } from "./types.ts";
import { getFaviconUrl } from "./store.ts";
import { AppContextMenu } from "./AppContextMenu.tsx";
import { AppAddModal } from "./AppAddModal.tsx";

interface Props {
  app: App;
  index: number;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

export function AppItem({
  app,
  index,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
}: Props) {
  const showMenu = useSignal(false);
  const showEditModal = useSignal(false);
  const menuPos = useSignal({ x: 0, y: 0 });

  const faviconUrl = getFaviconUrl(app.url);

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    menuPos.value = { x: e.clientX, y: e.clientY };
    showMenu.value = true;
  };

  const handleDragStart = (e: DragEvent) => {
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", index.toString());
    }
    onDragStart(index);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move";
    }
    onDragOver(index);
  };

  return (
    <>
      <a
        href={app.url}
        class={`app-item ${isDragging ? "is-dragging" : ""}`}
        onContextMenu={handleContextMenu}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={onDragEnd}
      >
        <img src={faviconUrl} alt="" class="app-favicon" loading="lazy" />
        <span class="app-name">{app.name}</span>
      </a>
      {showMenu.value && (
        <AppContextMenu
          app={app}
          position={menuPos.value}
          onClose={() => (showMenu.value = false)}
          onEdit={() => (showEditModal.value = true)}
        />
      )}
      {showEditModal.value && (
        <AppAddModal
          editApp={app}
          onClose={() => (showEditModal.value = false)}
        />
      )}
    </>
  );
}
