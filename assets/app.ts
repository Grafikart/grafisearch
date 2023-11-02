import "./css/app.scss";
import { SearchForm } from "./components/SearchForm.js";
import { SearchResults } from "./components/SearchResults.tsx";
import { register } from "./functions/preact/register.ts";

register(SearchForm, "search-form", [], { shadow: false });
register(SearchResults, "search-results", ["source"], { shadow: false });

document
  .querySelector(".bad-results")!
  .addEventListener("click", async (e: Event) => {
    e.preventDefault();
    const button = e.currentTarget as HTMLButtonElement;
    const q = new URL(window.location.href).searchParams.get("q") as string;
    const r = await fetch("/api/log", {
      body: JSON.stringify({
        q,
        found: false,
        googleFound: false,
      }),
      method: "POST",
    });
    if (!r.ok) {
      alert((await r.json()).message);
    } else {
      button.classList.add("is-active");
    }
  });
