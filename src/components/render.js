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
    const a = document.createElement("a");
    a.href = s.url;
    a.textContent = s.title;
    a.target = "_blank";
    li.appendChild(a);
    sl.appendChild(li);
  }
  src.appendChild(sl);
  root.appendChild(src);
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
  for (const s of miss.suggestions || []) {
    const li = document.createElement("li");
    li.textContent = s.title;
    li.dataset.id = s.id;
    sug.appendChild(li);
  }
  box.appendChild(h);
  box.appendChild(p);
  box.appendChild(actions);
  box.appendChild(sug);
  root.appendChild(box);
}
