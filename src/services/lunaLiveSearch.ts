
'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function searchTavily(query: string) {
  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.TAVILY_API_KEY}`
      },
      body: JSON.stringify({
        query: query,
        num_results: 5,
        search_depth: "advanced",
        include_answer: true
      })
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Tavily search failed:", error);
    return null;
  }
}

export async function answerWithLiveSearch(question: string) {
  const webPatterns = ["latest", "current", "today", "this month", "recent", "updates", "news", "movies"];
  const needsWeb = webPatterns.some(pattern => question.toLowerCase().includes(pattern));
  
  if (!needsWeb) {
    // Direct Gemini call
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(question);
    return {
      answer: result.response.text(),
      sources: [],
      has_live_data: false
    };
  }

  // Web search + Gemini
  const searchResults = await searchTavily(question);
  
  if (!searchResults) {
    return {
      answer: "I tried to search for current information but encountered an issue. Please try again.",
      sources: [],
      has_live_data: false
    };
  }

  const context = searchResults.results
    ?.map((r: any) => `${r.title}: ${r.content} (${r.url})`)
    .join("\n\n") || "";

  const prompt = `Based on this current information:\n\n${context}\n\nQuestion: ${question}\n\nProvide a comprehensive answer with source URLs in parentheses.`;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);

  return {
    answer: result.response.text(),
    sources: searchResults.results?.map((r: any) => ({ title: r.title, url: r.url })) || [],
    has_live_data: true
  };
}
