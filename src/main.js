import { loadIndex, findByQuery } from "./services/search/index.js";
import { normalizeQuery, loadAliases, applyAlias } from "./utils/normalize.js";
import { getEventById, buildMissState, generateSummaryPlaceholder } from "./services/retrieval/index.js";
import { renderSummary, renderMiss } from "./components/render.js";

async function init() {
  const input = document.getElementById("historySearch");
  const submit = document.getElementById("historySubmit");
  const output = document.getElementById("historyOutput");
  if (!input || !submit || !output) return;

  const index = await loadIndex();
  const aliases = await loadAliases();

  submit.addEventListener("click", async () => {
    const raw = input.value || "";
    const norm = normalizeQuery(raw);
    if (!norm) {
      output.innerHTML = "";
      return;
    }
    const aliased = applyAlias(norm, aliases) || norm;
    const id = findByQuery(aliased, index);
    if (id) {
      const event = await getEventById(id);
      if (event) {
        renderSummary(output, event);
        return;
      }
    }
    const suggestions = index.filter((it) => it.title.toLowerCase().includes(norm)).slice(0, 5);
    renderMiss(output, buildMissState(raw, suggestions));
    output.querySelector("[data-action='generate']")?.addEventListener("click", async () => {
      const placeholder = await generateSummaryPlaceholder(raw);
      renderSummary(output, placeholder);
    });
    output.querySelector("[data-action='similar']")?.addEventListener("click", () => {
      const list = output.querySelector(".miss-box ul");
      if (!list) return;
      list.style.display = "block";
    });
  });
}

document.addEventListener("DOMContentLoaded", init);
