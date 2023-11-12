import "./css/app.scss";
import { pushSearch } from "./signals/search.ts";
import "./components/SearchForm.tsx";
import "./components/SearchResults.tsx";

document.querySelector(".logo")!.addEventListener("click", (e) => {
  e.preventDefault();
  pushSearch("");
});

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
