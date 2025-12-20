export async function getEventById(id) {
  try {
    const res = await fetch(`data/events/${id}.json`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function buildMissState(query, suggestions = []) {
  return {
    missing: true,
    query,
    suggestions
  };
}

export async function generateSummaryPlaceholder(query) {
  return {
    id: `pending-${Date.now()}`,
    title: query,
    years: { start: null, end: null },
    region: [],
    key_facts: [
      "Auto-generated summary placeholder",
      "Connect to a server to fetch sources and generate"
    ],
    causes: ["Pending external retrieval"],
    outcome: ["Pending external retrieval"],
    figures: [],
    impacts: ["Pending external retrieval"],
    sources: [],
    aliases: []
  };
}
