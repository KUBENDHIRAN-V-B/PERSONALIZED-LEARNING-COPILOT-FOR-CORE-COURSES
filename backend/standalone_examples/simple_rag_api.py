import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

# Import our simple vector store module
from simple_vector_store import VectorStorePipeline
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# Load environment variables (API keys)
load_dotenv()

app = FastAPI(title="Simple RAG API")

# Initialize Vector Store
vector_store = VectorStorePipeline()
# Ensure index is loaded
vector_store.load()

class QuestionRequest(BaseModel):
    question: str

class Citation(BaseModel):
    source: str
    page: int
    score: float

class AnswerResponse(BaseModel):
    answer: str
    citations: List[Citation]

def get_llm():
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY not found in .env")
    
    return ChatOpenAI(
        model="google/gemini-2.0-flash-001", # Capable and fast model
        api_key=api_key,
        base_url="https://openrouter.ai/api/v1",
        default_headers={
            "HTTP-Referer": "http://localhost:8000",
            "X-Title": "Simple RAG API"
        }
    )

@app.post("/qa", response_model=AnswerResponse)
async def answer_question(request: QuestionRequest):
    # 1. Retrieve Context
    results = vector_store.search(request.question, k=4)
    
    # 2. Check for relevance (basic threshold or empty)
    if not results:
        return AnswerResponse(
            answer="Not found in uploaded material.",
            citations=[]
        )
    
    # Filter by score if needed (lower is better for L2, but here we just take top k)
    # If the best score is too high (bad match), we could return "Not found"
    # For FAISS L2: < 1.0 is usually good, > 1.5 is vague. 
    # Let's say if best score > 1.3, we claim ignorance.
    if results[0]['score'] > 1.3:
         return AnswerResponse(
            answer="Not found in uploaded material (low relevance).",
            citations=[]
        )

    # 3. Format Context
    context_text = ""
    citations = []
    seen_sources = set()

    for res in results:
        meta = res['metadata']
        source_id = f"{meta.get('source')} p{meta.get('page')}"
        
        context_text += f"---\nSource: {meta.get('source')} (Page {meta.get('page')})\nContent: {res['content']}\n"
        
        if source_id not in seen_sources:
            citations.append(Citation(
                source=meta.get('source', 'unknown'),
                page=meta.get('page', 0),
                score=res['score']
            ))
            seen_sources.add(source_id)

    # 4. Construct Prompt
    system_prompt = (
        "You are a helpful assistant. Use ONLY the provided context to answer the question.\n"
        "If the answer is not in the context, say 'Not found in uploaded material'.\n"
        "Do not use outside knowledge.\n"
        "Cite the page numbers in your answer (e.g. [Page 5]) if relevant."
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "Context:\n{context}\n\nQuestion: {question}")
    ])

    # 5. Call LLM
    try:
        llm = get_llm()
        chain = prompt | llm | StrOutputParser()
        answer = chain.invoke({
            "context": context_text,
            "question": request.question
        })
        
        return AnswerResponse(answer=answer, citations=citations)
        
    except Exception as e:
        print(f"LLM Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("Starting RAG API on http://127.0.0.1:8001")
    uvicorn.run(app, host="127.0.0.1", port=8001)
