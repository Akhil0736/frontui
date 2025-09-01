
'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function answerWithLiveSearch(question: string) {
  console.log("🔍 Starting live search for:", question);

  // Step 1: Get live data from Tavily
  let webContext = "";
  try {
    const tavilyResponse = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.TAVILY_API_KEY}`
      },
      body: JSON.stringify({
        query: question,
        num_results: 5,
        search_depth: "advanced"
      })
    });

    if (tavilyResponse.ok) {
      const data = await tavilyResponse.json();
      webContext = data.results
        ?.map((r: any) => `${r.title}: ${r.content} (${r.url})`)
        .join("\n\n") || "";
      console.log("✅ Tavily success, got", data.results?.length, "results");
    } else {
      console.error("❌ Tavily failed:", tavilyResponse.status);
    }
  } catch (error) {
    console.error("❌ Tavily error:", error);
  }

  // Step 2: Generate answer with Gemini
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = webContext 
    ? `Based on this current web information:\n\n${webContext}\n\nQuestion: ${question}\n\nProvide a comprehensive answer with source URLs.`
    : `Question: ${question}\n\nAnswer based on general knowledge:`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("❌ Gemini error:", error);
    return "I encountered an issue generating the response. Please try again.";
  }
}
