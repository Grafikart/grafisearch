import type { Accessor } from "solid-js";
import { createEffect } from "solid-js";

export function useSignalClass(
  element: HTMLElement,
  className: string,
  signal: Accessor<boolean>,
) {
  createEffect(() => {
    if (signal()) {
      element.classList.add(className);
    } else {
      element.classList.remove(className);
    }
  });
}
