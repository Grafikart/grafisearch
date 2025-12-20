import { signal } from "@preact/signals";
import type { App } from "./types.ts";

const storageKey = "grafisearch-apps";

function loadApps(): App[] {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveApps(apps: App[]) {
  localStorage.setItem(storageKey, JSON.stringify(apps));
}

export const apps = signal<App[]>(loadApps());

export function addApp(app: Omit<App, "id">) {
  const newApp: App = {
    ...app,
    id: crypto.randomUUID(),
  };
  apps.value = [...apps.value, newApp];
  saveApps(apps.value);
}

export function removeApp(id: string) {
  apps.value = apps.value.filter((app) => app.id !== id);
  saveApps(apps.value);
}

export function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return "";
  }
}
