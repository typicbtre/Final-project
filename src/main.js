import { loadIndex, findByQuery } from "./services/search/index.js";
import { normalizeQuery, loadAliases, applyAlias } from "./utils/normalize.js";
import { getEventById, buildMissState } from "./services/retrieval/index.js";
import { renderSummary, renderMiss } from "./components/render.js";

// Local fallback: build a minimal placeholder event when generation service isn't available
function buildLocalPlaceholder(query) {
  const title = (query || "").trim();
  const id = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "temporary-topic";
  return {
    id,
    title: title || "Untitled Topic",
    years: { start: null, end: null },
    region: [],
    key_facts: [
      "Placeholder summary generated locally.",
      "Use Related and Parts to navigate to nearby topics.",
    ],
    causes: [],
    outcome: [],
    figures: [],
    impacts: [],
    sources: [],
    aliases: [title],
    related_events: [],
  };
}

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
    }
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


// Bookmark Management
function getBookmarks() {
  const saved = localStorage.getItem("bookmarks");
  return saved ? JSON.parse(saved) : [];
}

function saveBookmarks(bookmarks) {
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
}


async function init() {
  const input = document.getElementById("historySearch");
  const submit = document.getElementById("historySubmit");
  const output = document.getElementById("historyOutput");
  if (!input || !submit || !output) return;

  const index = await loadIndex();
  const aliases = await loadAliases();

  async function displayEvent(event) {
    if (!event) return;
    renderSummary(output, event);
    await attachLinkHandlers();
  }

  function updateBookmarksUI() {
    const section = document.getElementById("bookmarksSection");
    const list = document.getElementById("bookmarksList");
    if (!section || !list) return;

    const bookmarks = getBookmarks();
    if (bookmarks.length === 0) {
      section.style.display = "none";
      return;
    }

    section.style.display = "block";
    list.innerHTML = "";
    bookmarks.forEach((b) => {
      const pill = document.createElement("div");
      pill.className = "bookmark-pill";
      pill.dataset.id = b.id;
      pill.innerHTML = `<span>⭐</span> ${b.title}`;
      pill.addEventListener("click", async () => {
        const event = await getEventById(b.id);
        if (event) displayEvent(event);
      });
      list.appendChild(pill);
    });
  }

  function updateRecentUI() {
    const container = document.getElementById("recentSearches");
    const list = document.getElementById("recentSearchesList");
    if (!container || !list) return;

    const recent = getRecentSearches();
    if (recent.length === 0) {
      container.style.display = "none";
      return;
    }

    container.style.display = "block";
    list.innerHTML = "";// Clear previous list

    const label = document.createElement("p");
    label.className = "recent-label";
    label.style.fontSize = "0.85rem";
    label.style.color = "var(--text-light)";
    label.style.marginBottom = "8px";
    label.style.fontWeight = "600";
    label.textContent = "Recently Viewed:";
    list.appendChild(label);

    const pillContainer = document.createElement("div");
    pillContainer.style.display = "flex";
    pillContainer.style.flexWrap = "wrap";
    pillContainer.style.gap = "8px";

    recent.forEach(r => {
      const pill = document.createElement("div");
      pill.className = "bookmark-pill"; // reuse style
      pill.innerHTML = `<span>🕒</span> ${r.title}`;
      pill.addEventListener("click", async () => {
        const event = await getEventById(r.id);
        if (event) displayEvent(event);
      });
      pillContainer.appendChild(pill);
    });
    list.appendChild(pillContainer);
  }

  updateBookmarksUI();
  updateRecentUI();

  async function attachLinkHandlers() {
    // Set human-friendly labels using titles from index
    output.querySelectorAll("[data-link-id]").forEach((btn) => {
      const linkId = btn.getAttribute("data-link-id");
      if (!linkId) return;
      const match = index.find((it) => it.id === linkId);
      if (match && match.title) {
        btn.textContent = match.title;
      }
      // Restore click handler
      btn.addEventListener("click", async () => {
        const event = await getEventById(linkId);
        if (event) displayEvent(event);
      });
    });

    // Handle bookmark button
    const bookmarkBtn = document.getElementById("eventBookmarkBtn");
    if (bookmarkBtn) {
      const eventId = bookmarkBtn.dataset.id;
      const bookmarks = getBookmarks();
      if (bookmarks.some(b => b.id === eventId)) {
        bookmarkBtn.classList.add("active");
      }

      bookmarkBtn.addEventListener("click", () => {
        const titleEl = output.querySelector("h2");
        const title = titleEl ? titleEl.textContent : "Untitled Event";
        let bms = getBookmarks();
        const idx = bms.findIndex(b => b.id === eventId);
        if (idx > -1) {
          bms.splice(idx, 1);
          bookmarkBtn.classList.remove("active");
        } else {
          bms.push({ id: eventId, title: title });
          bookmarkBtn.classList.add("active");
        }
        saveBookmarks(bms);
        updateBookmarksUI();
      });
    }

    // Handle similar topics button
    output.querySelectorAll("[data-action='similar']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const list = output.querySelector(".miss-box ul");
        if (list) {
          list.style.display = "block";
          btn.style.display = "none"; // Hide button after showing list
        }
      });
    });

    // Handle clicking a suggestion item
    output.querySelectorAll(".miss-box ul li").forEach((li) => {
      li.addEventListener("click", async () => {
        const id = li.getAttribute("data-id");
        if (!id) return;
        const event = await getEventById(id);
        if (event) displayEvent(event);
      });
    });
  }

  // Recent Searches Management
  function getRecentSearches() {
    const saved = localStorage.getItem("recentSearches");
    return saved ? JSON.parse(saved) : [];
  }

  function addRecentSearch(id, title) {
    let recent = getRecentSearches();
    recent = recent.filter((r) => r.id !== id);
    recent.unshift({ id, title });
    recent = recent.slice(0, 5);
    localStorage.setItem("recentSearches", JSON.stringify(recent));
    updateRecentUI();
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
        addRecentSearch(event.id, event.title);
        displayEvent(event);
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
        return fields.some((f) => f.includes(rawLower) || f.includes(norm));
      })
      .slice(0, 5);
    renderMiss(output, buildMissState(raw, suggestions));
    await attachLinkHandlers();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupThemeToggle();
  init();
});
