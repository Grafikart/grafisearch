import { type Signal } from "@preact/signals";

export function useSignalClass(
  element: HTMLElement,
  className: string,
  signal: Signal<boolean>,
) {
  if (signal.value) {
    element.classList.add(className);
  } else {
    element.classList.remove(className);
  }
}
