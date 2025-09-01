from tavily import TavilyClient
import os

class TavilyService:
    def __init__(self):
        self.client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
    
    def search(self, query: str, max_results: int = 5):
        try:
            response = self.client.search(
                query=query,
                search_depth="advanced",
                max_results=max_results,
                include_answer=True
            )
            return response
        except Exception as e:
            print(f"Tavily search failed: {e}")
            return None
    
    def extract_from_urls(self, urls: list):
        try:
            response = self.client.extract(urls=urls, include_images=False)
            return response
        except Exception as e:
            print(f"Tavily extract failed: {e}")
            return None
