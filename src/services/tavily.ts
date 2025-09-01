
'use server';

export type LiveSearchResult =
  | { answer: string; sources: Array<{ title: string; url: string }> }
  | string; // fallback message

export async function liveSearch(query: string): Promise<LiveSearchResult> {
  const apiKey = process.env.TAVILY_API_KEY;
  const url = "https://api.tavily.com/search";

  if (!apiKey) {
    console.error('TAVILY_API_KEY is not set');
    return "⚠️ Live search is not configured.";
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query,
        search_depth: "advanced",
        include_answer: true,
        max_results: 5,
      }),
    });

    if (!res.ok) {
      console.error(`Tavily HTTP ${res.status}: ${res.statusText}`);
      return "⚠️ Live search failed (service unavailable).";
    }

    const data = await res.json();
    return data?.answer
      ? { answer: data.answer, sources: data.results ?? [] }
      : "⚠️ No recent information found.";
  } catch (err) {
    console.error("Tavily fetch error:", err);
    return "⚠️ Error fetching live data.";
  }
}
