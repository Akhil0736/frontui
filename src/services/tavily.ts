
'use server';

export async function search(query: string) {
  const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
  if (!TAVILY_API_KEY) {
    throw new Error('TAVILY_API_KEY is not set');
  }

  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: TAVILY_API_KEY,
      query: query,
      max_results: 5,
      include_domains: [], // optional: restrict to sites
      search_depth: 'advanced', // broader crawling
    }),
  });

  if (!res.ok) {
    throw new Error(`Tavily search request failed with status ${res.status}`);
  }
  return res.json();
}

export async function liveSearch(question: string) {
  try {
    const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
    if (!TAVILY_API_KEY) {
      throw new Error('TAVILY_API_KEY is not set');
    }
    
    const res = await fetch("https://api.tavily.com/qna_search", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
            api_key: TAVILY_API_KEY,
            query: question 
        })
    });

    if (!res.ok) {
        console.error(`Tavily request failed with status: ${res.status}`);
        return null;
    }
    
    return res.json();   // { answer, sources[] }
  } catch (err) {
    console.error("Tavily error:", err);
    return null;              // graceful fallback
  }
}
