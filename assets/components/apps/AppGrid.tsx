import { useSignal } from "@preact/signals";
import { apps } from "./store.ts";
import { AppItem } from "./AppItem.tsx";
import { AppAddModal } from "./AppAddModal.tsx";

export function AppGrid() {
  const showModal = useSignal(false);

  return (
    <section class="apps-grid">
      {apps.value.map((app) => (
        <AppItem key={app.id} app={app} />
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
