import { pushSearch, searchQuery } from "../signals/search.ts";
import { useSignalClass } from "../hooks/useSignalClass.ts";
import { createEffect, createSignal, type JSX, onMount } from "solid-js";
import { customElement, noShadowDOM } from "solid-element";

customElement("search-form", {}, (_, { element }) => {
  if (!(element instanceof HTMLElement)) {
    return null;
  }
  noShadowDOM();
  const [isFocused, setFocused] = createSignal(false);
  const [isMultiline, setMultiline] = createSignal(false);
  let inputRef: HTMLDivElement;

  const handleKeyDown: JSX.EventHandler<HTMLDivElement, KeyboardEvent> = (
    e: KeyboardEvent,
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  const handleInput: JSX.EventHandler<HTMLDivElement, Event> = (e) => {
    setMultiline(e.currentTarget.innerText.includes("\n"));
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    pushSearch(inputRef.innerText);
  };

  createEffect(() => {
    if (searchQuery() && inputRef) {
      inputRef.innerText = searchQuery();
    }
  });

  useSignalClass(element, "is-focused", isFocused);
  useSignalClass(element, "is-expanded", isMultiline);
  useSignalClass(document.body, "has-focus", isFocused);

  onMount(() => {
    inputRef.focus();
  });

  return (
    <>
      <div
        ref={(el) => (inputRef = el)}
        role="textbox"
        contentEditable
        class="search-input"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
      />
      <button tabindex={-1} class="search-button" onClick={handleSubmit}>
        <svg width="30" height="24" viewBox="0 0 25 25">
          <path
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-miterlimit="10"
            fill="none"
            d="M23.75 23.75l-9-9"
          />
          <circle
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-miterlimit="10"
            cx="9"
            cy="9"
            r="7.75"
            fill="none"
          />
          <path fill="none" d="M25 25h-25v-25h25z" />
        </svg>
      </button>
    </>
  );
});
