
'use server';

import 'dotenv/config';

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

  if (!res.ok) {
    throw new Error(`Tavily search request failed with status ${res.status}`);
  }
  return res.json();
}

export async function liveSearch(question: string) {
  const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
  if (!TAVILY_API_KEY) {
    console.error('TAVILY_API_KEY is not set');
    return null;
  }
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TAVILY_API_KEY}`,
      },
      body: JSON.stringify({
        query: question,
        search_depth: 'basic',
        include_answer: true,
      }),
    });

    if (!res.ok) {
      console.error('Tavily API error:', await res.text());
      return null;
    }

    const data = await res.json();
    return {
      answer: data.answer,
      sources: data.results.map((r: any) => ({
        title: r.title,
        url: r.url,
      })),
    };
  } catch (err) {
    console.error('Tavily error:', err);
    return null; // graceful fallback
  }
}
