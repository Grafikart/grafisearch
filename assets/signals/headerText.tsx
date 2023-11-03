import { signal } from "@preact/signals";
import { render, type ComponentChild } from "preact";

export const headerText = signal<ComponentChild>(null);

render(
  <>{headerText}</>,
  document.querySelector(".header-text") as HTMLDivElement,
);
