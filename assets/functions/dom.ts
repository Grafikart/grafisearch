export function withViewTransition(transition: () => void) {
  if ("startViewTransition" in document) {
    document.startViewTransition(transition);
  } else {
    transition();
  }
}

const baseTitle = document.title

export function setPageTitle (name?: string | null): void {
  if (name) {
    document.title = `${name} - ${baseTitle}`
    return
  }
  document.title = `${baseTitle}`
}
