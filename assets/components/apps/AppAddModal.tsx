import { useSignal, useComputed } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
import { addApp, getFaviconUrl } from "./store.ts";

interface Props {
  onClose: () => void;
}

export function AppAddModal({ onClose }: Props) {
  const name = useSignal("");
  const url = useSignal("");
  const nameRef = useRef<HTMLInputElement>(null);

  const isValidUrl = useComputed(() => {
    try {
      new URL(url.value);
      return url.value.startsWith("http");
    } catch {
      return false;
    }
  });

  const canSubmit = useComputed(
    () => name.value.trim() !== "" && isValidUrl.value
  );

  const faviconUrl = useComputed(() =>
    isValidUrl.value ? getFaviconUrl(url.value) : ""
  );

  useEffect(() => {
    nameRef.current?.focus();

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!canSubmit.value) return;

    addApp({
      name: name.value.trim(),
      url: url.value.trim(),
    });
    onClose();
  };

  const handleOverlayClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div class="app-modal-overlay" onClick={handleOverlayClick}>
      <div class="app-modal">
        <h2>Ajouter un raccourci</h2>
        <form onSubmit={handleSubmit}>
          <div class="app-modal-field">
            <label for="app-name">Nom</label>
            <input
              ref={nameRef}
              id="app-name"
              type="text"
              value={name.value}
              onInput={(e) => (name.value = (e.target as HTMLInputElement).value)}
              placeholder="GitHub"
            />
          </div>
          <div class="app-modal-field">
            <label for="app-url">URL</label>
            <input
              id="app-url"
              type="text"
              value={url.value}
              onInput={(e) => (url.value = (e.target as HTMLInputElement).value)}
              placeholder="https://github.com"
            />
          </div>
          {isValidUrl.value && (
            <div class="app-modal-preview">
              <img src={faviconUrl.value} alt="" />
              <span>{name.value || "Apercu"}</span>
            </div>
          )}
          <div class="app-modal-actions">
            <button type="button" class="btn-cancel" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" class="btn-add" disabled={!canSubmit.value}>
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
