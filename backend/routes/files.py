from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import Document
from services.ingestion import ingestion_manager
import shutil
import os
from typing import List

router = APIRouter()

os.makedirs("uploads", exist_ok=True)

@router.post("/upload")
async def upload_files(
    files: List[UploadFile] = File(...), 
    db: Session = Depends(get_db)
):
    results = []
    for file in files:
        file_path = f"uploads/{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        file_type = "document"
        if "syllabus" in file.filename.lower():
            file_type = "syllabus"
        
        try:
            num_chunks = ingestion_manager.process_document(file_path, file.filename, file_type, db)
            results.append({"filename": file.filename, "chunks": num_chunks, "status": "processed"})
        except Exception as e:
            results.append({"filename": file.filename, "error": str(e), "status": "failed"})
    
    return {"status": "completed", "results": results}

@router.get("/files")
async def list_files(db: Session = Depends(get_db)):
    docs = db.query(Document).all()
    return docs

@router.get("/files/{document_id}")
async def view_file(document_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_path = os.path.abspath(f"uploads/{doc.filename}")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File content missing on server")
    
    return FileResponse(file_path, filename=doc.filename)

@router.delete("/files/{document_id}")
async def delete_file(document_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_path = os.path.abspath(f"uploads/{doc.filename}")
    
    # 1. Remove from Vector Database (Background chunks)
    try:
        ingestion_manager.remove_document(doc.filename)
    except Exception as e:
        print(f"Vector deletion failed: {e}")

    # 2. Remove from DB
    db.delete(doc)
    db.commit()
    
    # Remove from Filesystem
    if os.path.exists(file_path):
        os.remove(file_path)
    
    return {"status": "deleted", "document_id": document_id}

@router.post("/reset-system")
async def reset_system(db: Session = Depends(get_db)):
    """Wipes everything to solve background data issues"""
    return ingestion_manager.reset_all(db)
