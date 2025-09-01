import google.generativeai as genai
from .tavily_service import TavilyService
import os
import json

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

# Initialize Tavily
tavily_service = TavilyService()

def standard_luna_response(question: str):
    # A placeholder for your existing non-web-search logic
    # For now, just a simple Gemini call
    try:
        response = model.generate_content(question)
        return {
            "answer": response.text,
            "sources": [],
            "has_live_data": False
        }
    except Exception as e:
        print(f"Standard Gemini generation failed: {e}")
        return {
            "answer": "I'm having a little trouble thinking right now. Please try again later.",
            "sources": [],
            "has_live_data": False
        }

def answer_with_live_search(question: str):
    print(f"🔍 Searching for: {question}")
    
    # Step 1: Get live data from Tavily
    search_results = tavily_service.search(question)
    
    if not search_results:
        return "I encountered an issue searching for current information. Please try again."
    
    # Step 2: Format results for Gemini
    context_parts = []
    sources = []
    
    for result in search_results.get("results", []):
        context_parts.append(f"Title: {result['title']}\nContent: {result['content']}\nURL: {result['url']}")
        sources.append({
            "title": result['title'],
            "url": result['url']
        })
    
    web_context = "\n\n".join(context_parts)
    
    # Step 3: Generate answer with Gemini
    prompt = f"""Based on this current web information:

{web_context}

Question: {question}

Please provide a comprehensive answer using the information above. Include relevant URLs in parentheses when citing information."""

    try:
        response = model.generate_content(prompt)
        return {
            "answer": response.text,
            "sources": sources,
            "has_live_data": True
        }
    except Exception as e:
        print(f"Gemini generation failed: {e}")
        return "I found current information but had trouble generating a response. Please try again."

# For your existing Luna routing
def enhanced_luna_answer(user_question: str):
    # Detect if web search is needed
    web_patterns = [
        "latest", "current", "today", "this month", "recent", 
        "updates", "news", "movies", "weather", "price"
    ]
    
    needs_web = any(pattern in user_question.lower() for pattern in web_patterns)
    
    if needs_web:
        return answer_with_live_search(user_question)
    else:
        # Your existing Luna chat logic here
        return standard_luna_response(user_question)
