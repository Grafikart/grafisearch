import { useSignal } from "@preact/signals";
import { apps, reorderApps } from "./store.ts";
import { AppItem } from "./AppItem.tsx";
import { AppAddModal } from "./AppAddModal.tsx";

export function AppGrid() {
  const showModal = useSignal(false);
  const dragIndex = useSignal<number | null>(null);
  const dragOverIndex = useSignal<number | null>(null);

  const handleDragStart = (index: number) => {
    dragIndex.value = index;
  };

  const handleDragOver = (index: number) => {
    if (dragIndex.value !== null && dragIndex.value !== index) {
      dragOverIndex.value = index;
    }
  };

  const handleDragEnd = () => {
    if (dragIndex.value !== null && dragOverIndex.value !== null) {
      reorderApps(dragIndex.value, dragOverIndex.value);
    }
    dragIndex.value = null;
    dragOverIndex.value = null;
  };

  return (
    <section class="apps-grid">
      {apps.value.map((app, index) => (
        <AppItem
          key={app.id}
          app={app}
          index={index}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          isDragging={dragIndex.value === index}
        />
      ))}
      <button class="app-add" onClick={() => (showModal.value = true)}>
        +
      </button>
      {showModal.value && (
        <AppAddModal onClose={() => (showModal.value = false)} />
      )}
    </section>
  );
}
