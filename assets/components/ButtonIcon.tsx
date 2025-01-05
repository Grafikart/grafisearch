import clsx from "clsx";
import { type ComponentChildren } from "preact";

interface Props {
  children: ComponentChildren;
  onClick: () => void;
  className?: string;
}

export function ButtonIcon({ children, onClick, className }: Props) {
  return (
    <button onClick={onClick} class={clsx("btn-icon", className)}>
      {children}
    </button>
  );
}
