/**
 * Run a callback within a view transition if supported by the browser
 */
export function withViewTransition(transition: () => void) {
  if ("startViewTransition" in document) {
    document.startViewTransition(transition);
  } else {
    transition();
  }
}
