import { useEffect } from "preact/hooks";
import { SearchItemClassName } from "../components/search/SearchItem";

/**
 * Add arrow navigation inside the search result
 */
export function useArrowNavigation() {
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (!document.activeElement || document.activeElement.tagName !== "A") {
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        switchColumn();
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        focusSiblingResult("down");
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        focusSiblingResult("up");
      }
    };
    window.addEventListener("keydown", listener);
    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, []);
}

/**
 * Focus the first result of the other column
 */
const switchColumn = () => {
  const focusedElement = document.activeElement;
  const column = focusedElement?.closest(".search-column");
  if (!column) {
    return;
  }
  const sibling = column.nextElementSibling ?? column.previousElementSibling;
  if (!sibling) {
    return;
  }

  (
    sibling.querySelector(`.${SearchItemClassName} a`) as HTMLAnchorElement
  ).focus();
};

/**
 * Focus the next / previous search result
 */
const focusSiblingResult = (direction: "down" | "up") => {
  const focusedElement = document.activeElement;
  const item = focusedElement?.closest(`.${SearchItemClassName}`);
  // If we are not on a search item, focus the first one
  if (!item) {
    (
      document.querySelector(
        `.${SearchItemClassName} a`,
      ) as HTMLAnchorElement | null
    )?.focus();
    return;
  }
  // Select the next or previous element
  if (direction === "up") {
    item.previousElementSibling?.querySelector("a")?.focus();
  }
  if (direction === "down") {
    item.nextElementSibling?.querySelector("a")?.focus();
  }
};
