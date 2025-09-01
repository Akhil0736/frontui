
'use server';

import { TavilyClient } from "tavily";

const tavily = new TavilyClient({
  apiKey: process.env.TAVILY_API_KEY!
});

export async function searchWeb(query: string, maxResults = 8) {
  try {
    const response = await tavily.search({
      query,
      num_results: maxResults,
      search_depth: "advanced", // "basic" or "advanced"
      include_answer: true,      // Get AI-generated summary
      include_raw_content: false // Keep response lean
    });

    // Format results for Gemini
    const formattedResults = response.results
      .map(result => 
        `Title: ${result.title}\nURL: ${result.url}\nContent: ${result.content}\n`
      )
      .join('\n---\n');

    return {
      answer: response.answer,        // Tavily's AI summary
      sources: formattedResults,     // Individual search results
      results: response.results      // Raw results array
    };
  } catch (error) {
    console.error("Tavily search failed:", error);
    return null;
  }
}
