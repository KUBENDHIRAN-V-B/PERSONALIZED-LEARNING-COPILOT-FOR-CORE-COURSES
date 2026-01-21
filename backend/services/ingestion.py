from typing import List, Dict, Optional, Any
from sqlalchemy.orm import Session
VECTOR_DB_PATH = "faiss_index"

class IngestionManager:
    def __init__(self):
        self.embeddings = None
        self.vector_db = None
        # Lazy load to avoid startup hangs

    def _ensure_embeddings(self):
        import os
        if self.embeddings is None:
            from langchain_huggingface import HuggingFaceEmbeddings
            print("Initializing HuggingFace Embeddings (BAAI/bge-small-en-v1.5)...")
            self.embeddings = HuggingFaceEmbeddings(
                model_name="BAAI/bge-small-en-v1.5",
                model_kwargs={'device': 'cpu'},
                encode_kwargs={'normalize_embeddings': True}
            )

    def load_vector_db(self):
        """Loads the FAISS index from disk if it exists."""
        import os
        if os.path.exists(VECTOR_DB_PATH):
            self._ensure_embeddings()
            try:
                from langchain_community.vectorstores import FAISS
                self.vector_db = FAISS.load_local(
                    VECTOR_DB_PATH, 
                    self.embeddings, 
                    allow_dangerous_deserialization=True
                )
            except Exception as e:
                print(f"Failed to load vector DB: {e}")
                self.vector_db = None
        else:
            self.vector_db = None

    def clean_text(self, text: str) -> str:
        """
        Cleans text by removing excessive whitespace, newlines, and non-printable characters.
        """
        import re
        # Replace multiple newlines/tabs/spaces with a single space
        text = re.sub(r'\s+', ' ', text)
        # Remove non-printable characters
        text = text.encode('utf-8', 'ignore').decode('utf-8')
        return text.strip()

    def chunk_text(self, text: str, word_limit: int = 450, overlap: int = 50) -> List[str]:
        """
        Splits text into chunks of approximately `word_limit` words.
        """
        words = text.split()
        chunks = []
        for i in range(0, len(words), word_limit - overlap):
            chunk_words = words[i : i + word_limit]
            chunks.append(" ".join(chunk_words))
            if i + word_limit >= len(words):
                break
        return chunks

    def process_document(self, file_path: str, filename: str, file_type: str, db: Session) -> int:
        """
        Full pipeline: Open -> Clean -> Chunk -> Embed -> Store (Vector + SQL).
        """
        import fitz
        from langchain_core.documents import Document as LangchainDocument
        from db.models import Document
        
        self._ensure_embeddings()
        self.load_vector_db() # Reload to stay in sync with disk
        doc = fitz.open(file_path)
        all_splits = []

        course_name = filename.split('.')[0].replace('_', ' ').title() 

        for page_num, page in enumerate(doc):
            # 2. Extract Text
            raw_text = page.get_text()
            
            # 3. Clean Text
            cleaned_text = self.clean_text(raw_text)
            
            if not cleaned_text:
                continue

            # 4. Chunk Text
            text_chunks = self.chunk_text(cleaned_text, word_limit=450, overlap=50)

            # 5. Create Documents with Metadata
            for chunk in text_chunks:
                metadata = {
                    "source": filename,
                    "page": page_num + 1,
                    "course": course_name,
                    "type": file_type,
                }
                all_splits.append(LangchainDocument(page_content=chunk, metadata=metadata))

        doc.close()

        if not all_splits:
            raise ValueError("No readable text found in document. This might be a scanned image-only PDF. Please use a version with a text layer or OCR.")

        # 6. Embed & Store in FAISS
        from langchain_community.vectorstores import FAISS
        if self.vector_db is None:
            self.vector_db = FAISS.from_documents(all_splits, self.embeddings)
        else:
            self.vector_db.add_documents(all_splits)

        self.vector_db.save_local(VECTOR_DB_PATH)

        # 7. Save file metadata to SQL DB
        new_doc = Document(filename=filename, file_type=file_type)
        db.add(new_doc)
        db.commit()
        db.refresh(new_doc)
        
        return len(all_splits)

    def remove_document(self, filename: str):
        """
        Removes all chunks associated with a specific filename from the vector database.
        """
        self.load_vector_db() # Ensure we have latest from disk
        if self.vector_db is None:
            return

        all_ids = list(self.vector_db.docstore._dict.keys())
        ids_to_delete = []
        for doc_id in all_ids:
            doc = self.vector_db.docstore.search(doc_id)
            if doc and doc.metadata.get("source") == filename:
                ids_to_delete.append(doc_id)

        if ids_to_delete:
            try:
                self.vector_db.delete(ids_to_delete)
            except Exception:
                # Fallback
                remaining_docs = []
                for doc_id in all_ids:
                    if doc_id not in ids_to_delete:
                        remaining_docs.append(self.vector_db.docstore.search(doc_id))
                if remaining_docs:
                    from langchain_community.vectorstores import FAISS
                    self.vector_db = FAISS.from_documents(remaining_docs, self.embeddings)
                else:
                    self.vector_db = None
                    if os.path.exists(VECTOR_DB_PATH):
                        import shutil
                        shutil.rmtree(VECTOR_DB_PATH, ignore_errors=True)
                    return
            
            if self.vector_db:
                self.vector_db.save_local(VECTOR_DB_PATH)

    def reset_all(self, db):
        """Wipes everything: SQL, Filesystem, and Vector DB."""
        import os
        from db.models import Document
        
        # 1. Clear SQL
        db.query(Document).delete()
        db.commit()

        # 2. Clear Vector DB
        self.vector_db = None
        if os.path.exists(VECTOR_DB_PATH):
            import shutil
            shutil.rmtree(VECTOR_DB_PATH, ignore_errors=True)
        
        # 3. Clear Uploads
        if os.path.exists("uploads"):
            import shutil
            for f in os.listdir("uploads"):
                os.remove(os.path.join("uploads", f))
        
        return {"status": "success", "message": "System state fully reset."}

    def similarity_search(self, query: str, k: int = 4) -> List[Dict[str, Any]]:
        """
        Searches the vector database for chunks similar to the query.
        """
        self.load_vector_db()
        if self.vector_db is None:
            return []
        
        # perform search
        docs = self.vector_db.similarity_search(query, k=k)
        
        # format results
        results = []
        for doc in docs:
            results.append({
                "content": doc.page_content,
                "metadata": doc.metadata
            })
        return results

ingestion_manager = IngestionManager()
