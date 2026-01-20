import os
from typing import List, Dict, Any
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document

class VectorStorePipeline:
    def __init__(self, index_path: str = "faiss_index_simple"):
        self.index_path = index_path
        self.vector_db = None
        self.embeddings = None
        self._initialize_embeddings()

    def _initialize_embeddings(self):
        """Load bge-small embeddings model."""
        print("Loading BAAI/bge-small-en-v1.5 embeddings...")
        self.embeddings = HuggingFaceEmbeddings(
            model_name="BAAI/bge-small-en-v1.5",
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )

    def add_chunks(self, chunks: List[Dict[str, Any]]):
        """
        Converts text chunks into vectors and stores them in FAISS.
        chunks: List of dicts with 'text' and 'metadata' keys.
        """
        documents = []
        for chunk in chunks:
            doc = Document(
                page_content=chunk["text"],
                metadata=chunk.get("metadata", {})
            )
            documents.append(doc)

        if not documents:
            return

        if self.vector_db is None:
            print("Creating new FAISS index...")
            self.vector_db = FAISS.from_documents(documents, self.embeddings)
        else:
            print(f"Adding {len(documents)} documents to existing index...")
            self.vector_db.add_documents(documents)
        
        self.save()

    def search(self, query: str, k: int = 3) -> List[Dict[str, Any]]:
        """
        Search the vector database for the k most similar chunks.
        """
        if self.vector_db is None:
            self.load()
            
        if self.vector_db is None:
            print("Index not found or empty.")
            return []

        print(f"Searching for: '{query}'")
        results = self.vector_db.similarity_search_with_score(query, k=k)
        
        formatted_results = []
        for doc, score in results:
            formatted_results.append({
                "content": doc.page_content,
                "metadata": doc.metadata,
                "score": float(score)  # Lower is better (L2 distance)
            })
            
        return formatted_results

    def save(self):
        """Save the FAISS index locally."""
        if self.vector_db:
            self.vector_db.save_local(self.index_path)
            print(f"Index saved to {self.index_path}")

    def load(self):
        """Load the FAISS index from disk."""
        if os.path.exists(self.index_path):
            try:
                self.vector_db = FAISS.load_local(
                    self.index_path, 
                    self.embeddings, 
                    allow_dangerous_deserialization=True
                )
                print(f"Index loaded from {self.index_path}")
            except Exception as e:
                print(f"Error loading index: {e}")
        else:
            print("No existing index found.")

# Example Usage
if __name__ == "__main__":
    # 1. Initialize Pipeline
    pipeline = VectorStorePipeline()

    # 2. Mock Chunks (simulating output from pdf_processor)
    sample_chunks = [
        {
            "text": "Machine learning is a field of inquiry devoted to understanding and building methods that 'learn', that is, methods that leverage data to improve performance on some set of tasks.",
            "metadata": {"source": "ml_intro.pdf", "page": 1}
        },
        {
            "text": "Deep learning is part of a broader family of machine learning methods based on artificial neural networks with representation learning.",
            "metadata": {"source": "ml_intro.pdf", "page": 1}
        },
        {
            "text": "Python is a high-level, general-purpose programming language. Its design philosophy emphasizes code readability with the use of significant indentation.",
            "metadata": {"source": "python_guide.pdf", "page": 5}
        }
    ]

    # 3. Add to Database
    pipeline.add_chunks(sample_chunks)

    # 4. Search
    query = "What is deep learning?"
    results = pipeline.search(query)

    print("\n--- Search Results ---")
    for i, res in enumerate(results):
        print(f"\nResult {i+1} (Score: {res['score']:.4f}):")
        print(f"Text: {res['content']}")
        print(f"Source: {res['metadata']['source']} (Page {res['metadata']['page']})")
