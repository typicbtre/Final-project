let cachedIndex = null;

const fallbackIndex = [
  { id: "world-war-i", title: "World War I", years: { start: 1914, end: 1918 }, aliases: ["WWI","WW1", "First World War", "Great War","The Great War","World War One","World War 1","The War To End All Wars"] },
  { id: "world-war-ii", title: "World War II", years: { start: 1939, end: 1945 }, aliases: ["WWII","WW2", "Second World War","World War Two","World War 2"] },
  { id: "french-revolution", title: "French Revolution", years: { start: 1789, end: 1799 }, aliases: ["Revolution française", "1789 Revolution", "The French Revolution"] }
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
  return null;
}
