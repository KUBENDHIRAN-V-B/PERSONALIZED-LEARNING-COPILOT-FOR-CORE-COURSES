import fitz  # PyMuPDF
import re
from typing import List, Dict, Any

class PDFProcessor:
    def __init__(self, chunk_word_limit: int = 450, overlap: int = 50):
        self.chunk_word_limit = chunk_word_limit
        self.overlap = overlap

    def clean_text(self, text: str) -> str:
        """
        Cleans text by removing excessive whitespace, newlines, and non-printable characters.
        """
        # Replace multiple newlines/tabs/spaces with a single space
        text = re.sub(r'\s+', ' ', text)
        # Remove non-printable characters
        text = text.encode('utf-8', 'ignore').decode('utf-8')
        return text.strip()

    def chunk_text(self, text: str) -> List[str]:
        """
        Splits text into chunks of approximately `word_limit` words.
        """
        words = text.split()
        chunks = []
        for i in range(0, len(words), self.chunk_word_limit - self.overlap):
            chunk_words = words[i : i + self.chunk_word_limit]
            chunks.append(" ".join(chunk_words))
            if i + self.chunk_word_limit >= len(words):
                break
        return chunks

    def process_pdf(self, file_path: str) -> List[Dict[str, Any]]:
        """
        Extracts, cleans, and chunks text from a PDF page-by-page.
        """
        doc = fitz.open(file_path)
        processed_chunks = []
        filename = file_path.split("/")[-1].split("\\")[-1]

        print(f"Processing: {filename} ({len(doc)} pages)")

        for page_num, page in enumerate(doc):
            # 1. Extract Text
            raw_text = page.get_text()
            
            # 2. Clean Text
            cleaned_text = self.clean_text(raw_text)
            
            if not cleaned_text:
                continue

            # 3. Chunk Text
            text_chunks = self.chunk_text(cleaned_text)

            # 4. Store Chunks with Metadata
            for chunk_id, chunk_content in enumerate(text_chunks):
                chunk_data = {
                    "text": chunk_content,
                    "metadata": {
                        "filename": filename,
                        "page": page_num + 1,
                        "chunk_id": chunk_id,
                        "word_count": len(chunk_content.split())
                    }
                }
                processed_chunks.append(chunk_data)

        doc.close()
        return processed_chunks

# Example Usage
if __name__ == "__main__":
    import os
    
    # Create a dummy PDF for testing if one doesn't exist
    test_pdf = "test_doc.pdf"
    if not os.path.exists(test_pdf):
        doc = fitz.open()
        page = doc.new_page()
        page.insert_text((50, 50), "This is a test PDF document. " * 500)
        doc.save(test_pdf)
        doc.close()
        print(f"Created dummy PDF: {test_pdf}")

    processor = PDFProcessor(chunk_word_limit=400, overlap=50)
    chunks = processor.process_pdf(test_pdf)
    
    print(f"\nExtracted {len(chunks)} chunks.")
    if chunks:
        print("\n--- Sample Chunk 1 ---")
        print(f"Metadata: {chunks[0]['metadata']}")
        print(f"Text Preview: {chunks[0]['text'][:100]}...")
