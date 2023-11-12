import { createEffect, createSignal, type JSX, Match, Switch } from "solid-js";
import { Dynamic, render } from "solid-js/web";

const [headerText, setHeader] = createSignal<string | (() => JSX.Element)>("");

export const setHeaderText = setHeader;

render(
  () => {
    createEffect(() => {
      console.log("headerText", headerText());
    });
    return (
      <Switch fallback={headerText() as string}>
        <Match when={typeof headerText() === "function"}>
          <Dynamic component={headerText()} />
        </Match>
      </Switch>
    );
  },
  document.querySelector(".header-text") as HTMLDivElement,
);
