interface Window {
  BANGS: Record<string, string>;
}

interface GlobalEventHandlersEventMap {
  search: CustomEvent<string>;
}
