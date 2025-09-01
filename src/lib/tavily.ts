
'use server';

export async function searchWeb(query: string, maxResults = 8) {
  try {
    const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            api_key: process.env.TAVILY_API_KEY!,
            query,
            num_results: maxResults,
            search_depth: "advanced",
            include_answer: true,
            include_raw_content: false
        })
    });

    if (!response.ok) {
        console.error(`Tavily API error: ${response.status} ${response.statusText}`);
        return null;
    }

    const data = await response.json();

    const formattedResults = data.results
      .map(
        (result: { title: string; url: string; content: string }) =>
          `Title: ${result.title}\nURL: ${result.url}\nContent: ${result.content}\n`
      )
      .join("\n---\n");

    return {
      answer: data.answer,
      sources: formattedResults,
      results: data.results,
    };
  } catch (error) {
    console.error("Tavily search failed:", error);
    return null;
  }
}
