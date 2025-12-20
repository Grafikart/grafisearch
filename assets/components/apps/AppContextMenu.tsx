import { useEffect } from "preact/hooks";
import type { App } from "./types.ts";
import { removeApp } from "./store.ts";

interface Props {
  app: App;
  position: { x: number; y: number };
  onClose: () => void;
  onEdit: () => void;
}

export function AppContextMenu({ app, position, onClose, onEdit }: Props) {
  useEffect(() => {
    const handleClick = () => onClose();
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleEdit = (e: MouseEvent) => {
    e.stopPropagation();
    onEdit();
    onClose();
  };

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();
    removeApp(app.id);
    onClose();
  };

  return (
    <div
      class="app-context-menu"
      style={`left: ${position.x}px; top: ${position.y}px`}
    >
      <button onClick={handleEdit}>Modifier</button>
      <button onClick={handleDelete}>Supprimer</button>
    </div>
  );
}
