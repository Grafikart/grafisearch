import { useRef } from "preact/hooks";
import type { JSX } from "preact/jsx-runtime";
import { pushSearch, searchQuery } from "../signals/search.ts";
import { useSignal, useSignalEffect } from "@preact/signals";
import { useSignalClass } from "../hooks/useSignalClass.ts";

type Props = {
  element: HTMLElement;
};

export function SearchForm({ element }: Props) {
  const isFocused = useSignal(false);
  const isMultiline = useSignal(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown: JSX.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  const handleInput: JSX.GenericEventHandler<HTMLDivElement> = (e) => {
    isMultiline.value = e.currentTarget.innerText.includes("\n");
  };

  const handleSubmit: JSX.GenericEventHandler<HTMLElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    pushSearch(inputRef.current!.innerText);
  };

  useSignalEffect(() => {
    if (searchQuery.value && inputRef.current) {
      inputRef.current.innerText = searchQuery.value;
    }
  });

  useSignalEffect(() => {
    if (isFocused.value) {
      element.classList.add("is-focused");
    } else {
      element.classList.remove("is-focused");
    }
  });

  useSignalClass(element, "is-expanded", isMultiline);
  useSignalClass(document.body, "has-focus", isFocused);

  return (
    <>
      <div
        ref={inputRef}
        role="textbox"
        contentEditable
        autoFocus
        className="search-input"
        name="q"
        type="text"
        autoComplete="off"
        onFocus={() => (isFocused.value = true)}
        onBlur={() => (isFocused.value = false)}
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
}
