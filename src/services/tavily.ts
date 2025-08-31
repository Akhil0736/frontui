
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
       Authorization: `Bearer ${TAVILY_API_KEY}`,
    },
    body: JSON.stringify({
      query: query,
      max_results: 5,
      include_domains: [], // optional: restrict to sites
      search_depth: 'advanced', // broader crawling
    }),
  });

  return res.json();
}
