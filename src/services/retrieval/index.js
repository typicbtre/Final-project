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
