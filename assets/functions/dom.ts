export function withViewTransition(transition: () => void) {
  if ("startViewTransition" in document) {
    document.startViewTransition(transition);
  } else {
    transition();
  }
}
