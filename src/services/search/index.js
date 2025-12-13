let cachedIndex = null;

const fallbackIndex = [
  { id: "world-war-i", title: "World War I", years: { start: 1914, end: 1918 }, aliases: ["WWI", "First World War", "Great War"] },
  { id: "world-war-ii", title: "World War II", years: { start: 1939, end: 1945 }, aliases: ["WWII", "Second World War"] },
  { id: "french-revolution", title: "French Revolution", years: { start: 1789, end: 1799 }, aliases: ["Revolution française", "1789 Revolution"] }
];

export async function loadIndex() {
  if (cachedIndex) return cachedIndex;
  try {
    const res = await fetch("data/search-index.json");
    if (!res.ok) {
      cachedIndex = fallbackIndex;
      return cachedIndex;
    }
    const data = await res.json();
    cachedIndex = Array.isArray(data) ? data : fallbackIndex;
    return cachedIndex;
  } catch {
    cachedIndex = fallbackIndex;
    return cachedIndex;
  }
}

export function findByQuery(query, index) {
  const q = query.toLowerCase();
  for (const item of index) {
    if (item.title.toLowerCase() === q) return item.id;
    if (item.id.toLowerCase() === q) return item.id;
    if (Array.isArray(item.aliases)) {
      for (const a of item.aliases) {
        if (a.toLowerCase() === q) return item.id;
      }
    }
  }
  const byIncludes = index.find(
    (it) =>
      it.title.toLowerCase().includes(q) ||
      it.id.toLowerCase().includes(q) ||
      (Array.isArray(it.aliases) && it.aliases.some((a) => a.toLowerCase().includes(q)))
  );
  return byIncludes ? byIncludes.id : null;
}
