from services.ingestion import ingestion_manager, VECTOR_DB_PATH
from db.database import SessionLocal
from db.models import Document
import os

def cleanup_vector_db():
    print("Starting Vector DB cleanup...")
    db = SessionLocal()
    try:
        active_filenames = [d.filename for d in db.query(Document).all()]
        print(f"Active documents in SQL database: {active_filenames}")
        
        if ingestion_manager.vector_db is None:
            print("No vector database found.")
            return

        all_ids = list(ingestion_manager.vector_db.docstore._dict.keys())
        ids_to_delete = []
        
        for doc_id in all_ids:
            doc = ingestion_manager.vector_db.docstore.search(doc_id)
            if doc and doc.metadata.get("source") not in active_filenames:
                ids_to_delete.append(doc_id)

        print(f"Found {len(ids_to_delete)} orphan chunks (not linked to any entry in SQL).")
        
        if ids_to_delete:
            print(f"Deleting {len(ids_to_delete)} chunks...")
            # We use the same logic as our new remove_document fallback for safety
            all_docs = []
            for doc_id in all_ids:
                if doc_id not in ids_to_delete:
                    all_docs.append(ingestion_manager.vector_db.docstore.search(doc_id))
            
            if all_docs:
                from langchain_community.vectorstores import FAISS
                ingestion_manager.vector_db = FAISS.from_documents(all_docs, ingestion_manager.embeddings)
                ingestion_manager.vector_db.save_local(VECTOR_DB_PATH)
            else:
                print("All chunks were orphans. Removing vector database.")
                import shutil
                shutil.rmtree(VECTOR_DB_PATH, ignore_errors=True)
                ingestion_manager.vector_db = None
                
            print("Cleanup successful.")
        else:
            print("No cleanup needed.")
            
    finally:
        db.close()

if __name__ == "__main__":
    cleanup_vector_db()
