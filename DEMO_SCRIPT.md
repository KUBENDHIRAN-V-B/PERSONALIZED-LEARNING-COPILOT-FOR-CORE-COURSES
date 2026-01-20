
# Learning Copilot Demo Script

This script outlines the test flow for demonstrating the application's capabilities.

## 1. Setup
- Ensure Backend is running (`uvicorn main:app --reload`).
- Ensure Frontend is running (`npm run dev`).
- Open `http://localhost:5173`.

## 2. Ingestion (Upload Page)
1. Go to "Upload" page.
2. Upload `Data_Structures_Syllabus.txt`.
   - *Expected*: Success toast, file listed in "Uploaded Documents".
3. Upload `Signals_Systems_Syllabus.txt`.
   - *Expected*: Success toast.

## 3. Study Planning (Planner Page)
1. Go to "Planner".
2. **Scenario 1: Data Structures**
   - **Goal**: "Master Hashing and Trees"
   - **Exam Date**: Select a date 2 weeks from now.
   - **Hours**: 3
   - **Weak Topics**: "AVL Trees"
   - *Action*: Click "Create Strategy".
   - *Expected*: 
     - "Strategy Reasoning" mentions focusing on Trees/Hashing.
     - Schedule shows "AVL Trees" prioritized in Week 1.

## 4. Quiz & Learning (Quiz Page)
1. Go to "Quiz".
2. **Scenario 1: Take a Quiz**
   - **Topic**: "Binary Search Tree"
   - **Difficulty**: "Medium"
   - *Action*: Click "Start Quiz".
   - *Expected*: 5 questions generated from the uploaded syllabus context.
3. **Scenario 2: Submit & Fail**
   - Answer most questions incorrectly.
   - Click "Finish Quiz".
   - *Expected*: Result screen shows "Weak" status.
   - *Backend Check*: `topics` table should show low mastery for "Binary Search Tree".

## 5. Adaptive Loop (Planner Page)
1. Go back to "Planner".
2. **Scenario 2: Replanning**
   - **Goal**: "Review for Midterms"
   - **Exam Date**: 1 week away.
   - **Hours**: 5
   - **Weak Topics**: (Leave empty)
   - *Action*: Click "Create Strategy".
   - *Expected*: 
     - The "Strategy Reasoning" box should explicitly say: "Aggressively targeting weak topic: Binary Search Tree" (detected from the failed quiz).
     - The schedule should have heavy revisions for Binary Search Trees.

## 6. Dashboard Visualization
1. Go to "Dashboard".
2. *Expected*: 
   - Chart shows "Binary Search Tree" with a low red bar.
   - "Priority for Revision" list includes "Binary Search Tree".
   - "Recent Activity" lists the quiz just taken.
