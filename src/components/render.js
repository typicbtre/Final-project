function section(title, items) {
  const container = document.createElement("div");
  container.className = "card-section";
  const h = document.createElement("h3");
  h.textContent = title;
  container.appendChild(h);
  const list = document.createElement("ul");
  list.className = "bullet-list";
  for (const it of items) {
    const li = document.createElement("li");
    li.textContent = it;
    list.appendChild(li);
  }
  container.appendChild(list);
  return container;
}

export function renderSummary(root, event) {
  root.innerHTML = "";
  const header = document.createElement("div");
  header.className = "summary-header";
  const title = document.createElement("h2");
  title.textContent = event.title;
  const years = document.createElement("p");
  years.className = "years";
  const s = event.years?.start ?? "";
  const e = event.years?.end ?? "";
  years.textContent = s && e ? `${s}–${e}` : "";
  header.appendChild(title);
  header.appendChild(years);
  root.appendChild(header);

  const grid = document.createElement("div");
  grid.className = "card-grid";
  grid.appendChild(section("Key Facts", event.key_facts || []));
  grid.appendChild(section("Main Causes", event.causes || []));
  grid.appendChild(section("How it Ended", event.outcome || []));
  grid.appendChild(section("Important Figures", (event.figures || []).map((f) => `${f.name} — ${f.role}`)));
  grid.appendChild(section("Lasting Impact", event.impacts || []));
  root.appendChild(grid);

  const src = document.createElement("div");
  src.className = "sources";
  const sh = document.createElement("h3");
  sh.textContent = "Sources";
  src.appendChild(sh);
  const sl = document.createElement("ul");
  for (const s of event.sources || []) {
    const li = document.createElement("li");
    if (typeof s === "string") {
      li.textContent = s;
    } else {
      const a = document.createElement("a");
      a.href = s.url;
      a.textContent = s.title;
      a.target = "_blank";
      li.appendChild(a);
    }
    sl.appendChild(li);
  }
  src.appendChild(sl);
  root.appendChild(src);

  // Connected To section
  if (Array.isArray(event.related_events) && event.related_events.length > 0) {
    const connectedDiv = document.createElement("div");
    connectedDiv.className = "connected-to";
    // Inline container styling for clear separation
    connectedDiv.style.marginTop = "20px";
    connectedDiv.style.paddingTop = "10px";
    connectedDiv.style.borderTop = "1px solid var(--border-color)";
    
    const h3 = document.createElement("h3");
    h3.textContent = "Connected to:";
    h3.style.marginBottom = "8px";
    connectedDiv.appendChild(h3);

    const list = document.createElement("ul");
    list.className = "connected-list";
    // Horizontal pill layout with wrap
    list.style.listStyle = "none";
    list.style.display = "flex";
    list.style.flexWrap = "wrap";
    list.style.gap = "8px";
    list.style.padding = "0";
    
    // Style for the list to make it look nice (horizontal or bubbles)
    // We'll stick to a simple list or buttons for now.
    // Let's use button-like links similar to the "Related sections" below but properly integrated.
    
    const MAX_VISIBLE = 6;
    const items = event.related_events;
    let index = 0;
    for (const rel of items) {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.className = "connected-link";
      // Pill-like styling
      btn.style.background = "rgba(0,0,0,0.04)";
      btn.style.border = "1px solid var(--border-color)";
      btn.style.color = "var(--text-dark)";
      btn.style.cursor = "pointer";
      btn.style.textDecoration = "none";
      btn.style.fontSize = "0.95rem";
      btn.style.padding = "6px 10px";
      btn.style.borderRadius = "999px";
      btn.style.transition = "background-color .15s ease, color .15s ease";
      btn.onmouseenter = () => { btn.style.background = "var(--bg-light)"; };
      btn.onmouseleave = () => { btn.style.background = "rgba(0,0,0,0.04)"; };
      
      btn.textContent = rel.title || rel.id;
      btn.dataset.linkId = rel.id;
      
      // Hide beyond initial batch
      if (index >= MAX_VISIBLE) {
        li.style.display = "none";
      }
      index++;

      li.appendChild(btn);
      list.appendChild(li);
    }
    connectedDiv.appendChild(list);

    // Show more/less toggle if needed
    if (items.length > MAX_VISIBLE) {
      const toggle = document.createElement("button");
      toggle.textContent = "Show more";
      toggle.style.marginTop = "8px";
      toggle.style.background = "none";
      toggle.style.border = "none";
      toggle.style.color = "var(--primary-color)";
      toggle.style.textDecoration = "underline";
      toggle.style.cursor = "pointer";

      let expanded = false;
      toggle.addEventListener("click", () => {
        expanded = !expanded;
        const lis = Array.from(list.children);
        lis.forEach((li, i) => {
          if (i >= MAX_VISIBLE) li.style.display = expanded ? "" : "none";
        });
        toggle.textContent = expanded ? "Show less" : "Show more";
      });
      connectedDiv.appendChild(toggle);
    }
    root.appendChild(connectedDiv);
  }

  // Related navigation (parts/parents)
  const related = document.createElement("div");
  related.className = "related-links";
  const links = [];
  if (Array.isArray(event.parts) && event.parts.length) {
    const h = document.createElement("h3");
    h.textContent = "Related sections";
    related.appendChild(h);
    const wrap = document.createElement("div");
    wrap.className = "related-buttons";
    for (const pid of event.parts) {
      const btn = document.createElement("button");
      btn.className = "btn-link";
      // Inline minimal link-like styling
      btn.style.background = "none";
      btn.style.border = "none";
      btn.style.color = "var(--primary-color)";
      btn.style.padding = "4px 6px";
      btn.style.fontSize = "0.95rem";
      btn.style.textDecoration = "underline";
      btn.style.cursor = "pointer";
      btn.style.borderRadius = "6px";
      btn.dataset.linkId = pid;
      btn.textContent = pid;
      wrap.appendChild(btn);
      links.push(btn);
    }
    related.appendChild(wrap);
  }
  if (typeof event.parent === "string" && event.parent) {
    const wrap = document.createElement("div");
    wrap.className = "related-buttons";
    const back = document.createElement("button");
    back.className = "btn-link";
    // Inline minimal link-like styling
    back.style.background = "none";
    back.style.border = "none";
    back.style.color = "var(--primary-color)";
    back.style.padding = "4px 6px";
    back.style.fontSize = "0.95rem";
    back.style.textDecoration = "underline";
    back.style.cursor = "pointer";
    back.style.borderRadius = "6px";
    back.dataset.linkId = event.parent;
    back.textContent = "Back to main";
    wrap.appendChild(back);
    related.appendChild(wrap);
    links.push(back);
  }
  if (links.length) {
    root.appendChild(related);
  }
}

export function renderMiss(root, miss) {
  root.innerHTML = "";
  const box = document.createElement("div");
  box.className = "miss-box";
  const h = document.createElement("h2");
  h.textContent = "Not yet in our library";
  const p = document.createElement("p");
  p.textContent = `We couldn't find "${miss.query}".`;
  const actions = document.createElement("div");
  actions.className = "miss-actions";
  const gen = document.createElement("button");
  gen.className = "btn btn-primary";
  gen.textContent = "Generate summary now";
  gen.dataset.action = "generate";
  const similar = document.createElement("button");
  similar.className = "btn";
  similar.textContent = "See similar topics";
  similar.dataset.action = "similar";
  actions.appendChild(gen);
  actions.appendChild(similar);
  const sug = document.createElement("ul");
  // Hidden by default; revealed via the 'See similar topics' button
  sug.style.display = "none";
  for (const s of miss.suggestions || []) {
    const li = document.createElement("li");
    const desc = typeof s.description === "string" ? s.description : "";
    const snippet = desc.length > 120 ? desc.slice(0, 117) + "..." : desc;
    li.innerHTML = `<strong>${s.title}</strong>${snippet ? `<div class="suggestion-desc">${snippet}</div>` : ""}`;
    li.dataset.id = s.id;
    sug.appendChild(li);
  }
  box.appendChild(h);
  box.appendChild(p);
  box.appendChild(actions);
  box.appendChild(sug);
  root.appendChild(box);
}
