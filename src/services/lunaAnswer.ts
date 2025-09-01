
import { searchWeb } from "@/lib/tavily";
import { generateWithGemini } from "@/lib/gemini";

export async function answerLuna(userQuestion: string) {
  // Enhanced detection to include movies
  console.log("🔍 Received question:", userQuestion);
  const needsWebSearch = /(today|latest|news|current|recent|this month|this year|2025|movies?|weather)/i.test(userQuestion);
  console.log("🤔 Needs web search:", needsWebSearch);
  
  if (needsWebSearch) {
    try {
      // Step 1: Get live data from Tavily
      console.log("🌐 Triggering web search path...");
      console.log("🔍 Starting Tavily search...");
      const searchResults = await searchWeb(userQuestion);
      console.log("📊 Search results:", searchResults ? "Found" : "None");
      
      if (searchResults && searchResults.answer) {
        // Step 2: Use Gemini to synthesize answer with web context
        console.log("🧠 Generating answer with Gemini 2.5 Flash");
        const answer = await generateWithGemini(
          userQuestion,
          `Tavily Summary: ${searchResults.answer}\n\nDetailed Sources:\n${searchResults.sources}`
        );
        console.log("✅ Generated answer length:", answer.length);
        
        return {
          answer,
          sources: searchResults.results.map((r: { title: string; url: string; content: string; }) => ({
            title: r.title,
            url: r.url,
            snippet: r.content.substring(0, 200) + "..."
          })),
          hasWebResults: true
        };
      } else {
        // Handle case where Tavily returns no answer
        const fallbackAnswer = await generateWithGemini(userQuestion);
        return {
            answer: fallbackAnswer,
            sources: [],
            hasWebResults: false,
        };
      }
    } catch (error) {
      console.error("❌ Web search or generation failed:", error);
      // Return a user-facing error message
      return {
          answer: "I tried to search for current information but encountered an issue. Please try again later.",
          sources: [],
          hasWebResults: false,
      };
    }
  }
  
  // Fallback: Use Gemini without web context
  console.log("💬 Using default chat path...");
  const answer = await generateWithGemini(userQuestion);
  return {
    answer,
    sources: [],
    hasWebResults: false
  };
}
