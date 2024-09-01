import { type Signal, useComputed, useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
import clsx from "clsx";
import { JSX } from "preact/jsx-runtime";
import { SearchIcon } from "../icons.tsx";

type Props = {
  onSearch: (query: string) => void;
  defaultValue?: string;
  isLoading: Signal<boolean>;
};

export function SearchForm({ onSearch, defaultValue, isLoading }: Props) {
  const isFocused = useSignal(false);
  const isMultiline = useSignal(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFocus = () => {
    isFocused.value = true;
  };

  const onBlur = () => {
    isFocused.value = false;
  };

  const onSubmit = (e: Event) => {
    e.preventDefault();
    onSearch(inputRef.current?.innerText ?? "");
  };

  const className = useComputed(() =>
    clsx(
      "search-form",
      isFocused.value && "is-focused",
      isMultiline.value && "is-multiline",
      isLoading.value && "is-loading",
    ),
  );
  const btnClassName = useComputed(() => clsx(isLoading.value && "is-loading"));

  // Submit on enter (since we use a contenteditable element, we need to handle it manually)
  const handleKeyDown: JSX.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      onSubmit(e);
    }
  };

  // Detect multiline input to add a new class on the form
  const handleInput: JSX.GenericEventHandler<HTMLDivElement> = (e) => {
    isMultiline.value = e.currentTarget.innerText.includes("\n");
  };

  // Insert the right content inside the div
  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.innerHTML = defaultValue ?? "";
  }, []);

  return (
    <form action="#" className={className} onSubmit={onSubmit}>
      <div
        ref={inputRef}
        role="textbox"
        contentEditable
        autoFocus
        name="q"
        type="text"
        autoComplete="off"
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
      />
      <button type="submit" className={btnClassName}>
        <SearchIcon />
      </button>
    </form>
  );
}
