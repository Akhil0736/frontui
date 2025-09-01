
'use server';

export async function webSearch(
  query: string,
  k = 8,
  depth: "basic" | "advanced" = "basic"
) {
    try {
        const response = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                api_key: process.env.TAVILY_API_KEY,
                query,
                search_depth: depth,
                include_answer: false,
                max_results: k,
            }),
        });

        if (!response.ok) {
            console.error(`Tavily API error: ${response.statusText}`);
            return "Could not get a response from Tavily API.";
        }

        const data = await response.json();
        return data.results
            .map((r: { title: string; content: string; url: string; }) => `${r.title}\n${r.content}\n${r.url}`)
            .join("\n\n");
    } catch (err) {
        console.error("Tavily fetch error:", err);
        return "Error fetching live data from Tavily.";
    }
}
