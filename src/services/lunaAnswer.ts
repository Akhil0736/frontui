
import { searchWeb } from "@/lib/tavily";
import { generateWithGemini } from "@/lib/gemini";

export async function answerLuna(userQuestion: string) {
  // Detect if query needs real-time data
  const needsWebSearch = /(today|latest|news|current|recent|this month|this year|2025)/i.test(userQuestion);
  
  if (needsWebSearch) {
    try {
      // Step 1: Get live data from Tavily
      console.log("🔍 Searching web for:", userQuestion);
      const searchResults = await searchWeb(userQuestion);
      
      if (searchResults && searchResults.answer) {
        // Step 2: Use Gemini to synthesize answer with web context
        console.log("🧠 Generating answer with Gemini 1.5 Flash");
        const answer = await generateWithGemini(
          userQuestion,
          `Tavily Summary: ${searchResults.answer}\n\nDetailed Sources:\n${searchResults.sources}`
        );
        
        return {
          answer,
          sources: searchResults.results.map((r: { title: string; url: string; content: string; }) => ({
            title: r.title,
            url: r.url,
            snippet: r.content.substring(0, 200) + "..."
          })),
          hasWebResults: true
        };
      }
    } catch (error) {
      console.error("Live search failed, falling back to Gemini only:", error);
    }
  }
  
  // Fallback: Use Gemini without web context
  console.log("🧠 Generating answer with Gemini directly.");
  const answer = await generateWithGemini(userQuestion);
  return {
    answer,
    sources: [],
    hasWebResults: false
  };
}
