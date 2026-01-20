# 🚀 Learning Copilot

**Learning Copilot** is an advanced AI-powered educational platform designed to help students master complex engineering subjects. It combines **RAG (Retrieval-Augmented Generation)**, **Adaptive Quizzing**, and **Intelligent Scheduling** into a cohesive learning experience.

## ✨ Key Features

### 🧠 AI Tutor (RAG Chat)
- **Context-Aware**: Upload course PDFs, notes, or slides. The AI answers questions *strictly* based on your materials.
- **Academic Formatting**: Answers are structured with headers, tables, code blocks, and citations (e.g., `[Source: Textbook.pdf, Page 12]`).
- **Plan Integration**: The AI knows your active study plan and can guide you based on your schedule.

### 📅 AI Study Planner
- **Intelligent Roadmap**: Generates a week-by-week execution plan based on your syllabus and exam date.
- **Prioritization**: Automatically front-loads difficult topics and schedules revision slots.
- **Save & Track**: Save multiple plans and track your progress.

### 🎯 Adaptive Quiz & Mastery
- **Dynamic Testing**: Generates quizzes on any topic with adjustable difficulty.
- **AI Validation**: Short answers are graded by AI with partial credit and detailed feedback.
- **Mastery Tracking**: Visualizes your proficiency in different topics over time.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React (Vite)
- **Styling**: TailwindCSS + Framer Motion (Animations)
- **Icons**: Lucide React

### Backend
- **API Framework**: FastAPI
- **LLM Orchestration**: LangChain
- **Vector Database**: FAISS (CPU)
- **Embeddings**: HuggingFace (`BAAI/bge-small-en-v1.5`)
- **Database**: SQLite (SQLAlchemy ORM)
- **PDF Processing**: PyMuPDF (fitz)

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 16+
- API Key (OpenRouter, OpenAI, or Google Gemini)

### 1. Backend Setup

```bash
cd backend
python -m venv .venv
# Activate virtual environment
# Windows: .venv\Scripts\activate
# Mac/Linux: source .venv/bin/activate

pip install -r requirements.txt
```

**Environment Variables**:
Create a `.env` file in `backend/` and add your key:
```ini
OPENROUTER_API_KEY=sk-or-...
# OR
GOOGLE_API_KEY=...
# OR
OPENAI_API_KEY=...
```

**Run Server**:
```bash
python main.py
# Server runs at http://127.0.0.1:8000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

---

## 📂 Project Structure

```
learning-copilot/
├── backend/
│   ├── db/                 # Database models & connection
│   ├── planner/            # Study plan generation agent
│   ├── quiz/               # Quiz generation & grading agent
│   ├── rag/                # RAG pipeline & retrieval logic
│   ├── routes/             # API Endpoints
│   ├── services/           # Core logic (Ingestion, Mastery)
│   ├── standalone_examples/ # Modular reference implementations
│   └── main.py             # App entry point
│
└── frontend/
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── pages/          # Main application pages
    │   └── styles/         # Global styles
    └── package.json
```

## 🧩 Modular Components
The `backend/standalone_examples/` folder contains isolated, standalone scripts for specific features if you want to reuse them in other projects:
- `simple_pdf_processor.py`: Clean PDF text extraction & chunking.
- `simple_vector_store.py`: Minimal FAISS vector database wrapper.
- `simple_rag_api.py`: Standalone QA API server.
- `simple_planner_api.py`: Standalone Study Planner API server.

---

## 🤝 Contributing
1. Fork the repository
2. Create feature branch (`git checkout -b feature/NewFeature`)
3. Commit changes (`git commit -m 'Add NewFeature'`)
4. Push to branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

---
**Learning Copilot** — *Making Learning Effortless & Visually Clear.*
