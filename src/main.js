import { loadIndex, findByQuery } from "./services/search/index.js";
import { normalizeQuery, loadAliases, applyAlias } from "./utils/normalize.js";
import { getEventById, buildMissState, generateSummaryPlaceholder } from "./services/retrieval/index.js";
import { renderSummary, renderMiss } from "./components/render.js";

function setupThemeToggle() {
  const root = document.documentElement;
  const btn = document.getElementById("themeToggle");
  if (!btn) return;

  const apply = (mode) => {
    if (mode === "dark") {
      root.setAttribute("data-theme", "dark");
      btn.textContent = "☀️";
      btn.setAttribute("aria-pressed", "true");
      btn.title = "Switch to light mode";
    } else {
      root.removeAttribute("data-theme");
      btn.textContent = "🌙";
      btn.setAttribute("aria-pressed", "false");
      btn.title = "Switch to dark mode";
    };
  };

  // Initialize from storage (default: light)
  const saved = localStorage.getItem("theme");
  const initial = saved === "dark" ? "dark" : "light";
  apply(initial);

  btn.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    apply(next);
    localStorage.setItem("theme", next);
  });
}

async function init() {
  const input = document.getElementById("historySearch");
  const submit = document.getElementById("historySubmit");
  const output = document.getElementById("historyOutput");
  if (!input || !submit || !output) return;

  const index = await loadIndex();
  const aliases = await loadAliases();

  async function attachLinkHandlers() {
    // Set human-friendly labels using titles from index
    output.querySelectorAll("[data-link-id]").forEach((btn) => {
      const linkId = btn.getAttribute("data-link-id");
      if (!linkId) return;
      // Preserve explicit back label
      if (btn.textContent && btn.textContent.trim().toLowerCase() === "back to main") return;
      const match = index.find((it) => it.id === linkId);
      if (match && match.title) {
        btn.textContent = match.title;
      }
    });
    // Handle related links in summary view
    output.querySelectorAll("[data-link-id]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const linkId = btn.getAttribute("data-link-id");
        if (!linkId) return;
        const event = await getEventById(linkId);
        if (event) {
          renderSummary(output, event);
          // Rebind for the new view
          attachLinkHandlers();
        }
      });
    });
    // Handle clicking a suggestion item to open its event if available
    output.querySelectorAll(".miss-box ul li").forEach((li) => {
      li.addEventListener("click", async () => {
        const id = li.getAttribute("data-id");
        if (!id) return;
        const event = await getEventById(id);
        if (event) {
          renderSummary(output, event);
          attachLinkHandlers();
        }
      });
    });
  }

  submit.addEventListener("click", async () => {
    const raw = input.value || "";
    const rawLower = raw.trim().toLowerCase();
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
        await attachLinkHandlers();
        return;
      }
    }
    const suggestions = index
      .filter((it) => {
        const fields = [
          it.title,
          it.id,
          ...(Array.isArray(it.aliases) ? it.aliases : []),
          ...(Array.isArray(it.tags) ? it.tags.map(String) : []),
          typeof it.description === "string" ? it.description : "",
        ]
          .filter(Boolean)
          .map((s) => String(s).toLowerCase());
        // Match on either rawLower or normalized query
        return fields.some((f) => f.includes(rawLower) || f.includes(norm));
      })
      .slice(0, 5);
    renderMiss(output, buildMissState(raw, suggestions));
    await attachLinkHandlers();
    output.querySelector("[data-action='generate']")?.addEventListener("click", async () => {
      const placeholder = await generateSummaryPlaceholder(raw);
      renderSummary(output, placeholder);
      await attachLinkHandlers();
    });
    output.querySelector("[data-action='similar']")?.addEventListener("click", () => {
      const list = output.querySelector(".miss-box ul");
      if (!list) return;
      list.style.display = "block";
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupThemeToggle();
  init();
});
