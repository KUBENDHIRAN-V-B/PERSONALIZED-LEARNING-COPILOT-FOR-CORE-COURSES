# 🎓 Personalized Learning Copilot for Core Courses

An AI-powered adaptive learning platform designed for engineering students to master Computer Science and Electronics & Communication Engineering concepts through intelligent tutoring, real-time progress tracking, and personalized study recommendations.

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Key Features

### 🤖 Expert AI Tutor
- **Bring Your Own API Keys**: Use your own AI provider keys (Gemini, Groq, Claude, OpenRouter)
- **Multi-Provider Support**: Automatic fallback between providers for reliability
- **Expert Teaching Style**: Structured, step-by-step explanations with real-world examples
- **Course-Specific Context**: Tailored responses for each subject (DSA, COA, OS, DBMS, etc.)
- **Conversation Memory**: Maintains context for progressive learning
- **Markdown Formatting**: Beautiful code examples and structured explanations

### 📚 Comprehensive Course Library
**Computer Science (7 Courses):**
- Data Structures & Algorithms
- Computer Organization & Architecture
- Operating Systems
- Database Management Systems
- Computer Networks
- Software Engineering
- Programming Fundamentals

**Electronics & Communication (2 Courses):**
- Digital Electronics
- Signals & Systems

### 📊 Personalized Analytics
- **Study Timer**: Track focused study sessions with start/stop functionality
- **Peak Focus Time**: Identify and customize your most productive hours
- **Progress Tracking**: Visual mastery levels for each topic
- **Session History**: Review past study sessions and improvements

### 🎯 Custom Quiz System
- **Category Filtering**: Choose between CS or ECE topics
- **Difficulty Selection**: Easy, Medium, or Hard questions
- **Customizable Length**: 3-20 questions per quiz
- **Instant Feedback**: Detailed explanations for each answer
- **Performance Metrics**: Score, time taken, and accuracy tracking

### 🔒 Privacy-First Design
- **Local Storage**: API keys stored only in your browser
- **No Server Storage**: Keys sent directly to AI providers
- **Device-Specific**: Set up keys per device/browser
- **Secure Communication**: HTTPS and CORS protection

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org))
- Your own AI API key (Google Gemini, Groq, Anthropic Claude, or OpenRouter)

### Installation

```bash
# Clone the repository
git clone https://github.com/KUBENDHIRAN-V-B/PERSONALIZED-LEARNING-COPILOT-FOR-CORE-COURSES.git
cd "PERSONALIZED LEARNING COPILOT FOR CORE COURSES"

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Running Locally

**Option 1: Frontend Only (Recommended for Quick Start)**
```bash
cd frontend
npm start
```
Access at: http://localhost:3000

**Option 2: Full Stack (For AI Chat Functionality)**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### First-Time Setup

1. Open the app in your browser
2. You'll see the API Key Setup screen
3. Click "Add Another API Key"
4. Enter:
   - **Provider Name**: e.g., "Gemini", "Groq", "Claude"
   - **API Key**: Your actual API key
5. Click "Save & Continue"
6. Start learning!

---

## 🎓 AI Tutor System

### Expert Teaching Approach

The AI tutor follows a structured teaching methodology:

**Answer Structure:**
1. **Clear Definition** - Simple overview of the concept
2. **Logical Sections** - Break down into digestible parts
3. **Real-World Examples** - Practical analogies and use cases
4. **Code Examples** - Syntax-highlighted implementations (when relevant)
5. **Common Mistakes** - What to avoid
6. **Key Takeaways** - Summary points

**Example Response:**

```markdown
# Binary Search Algorithm

## Definition
Binary search is an efficient algorithm for finding a target value 
in a sorted array by repeatedly dividing the search interval in half.

## How It Works
1. Start with the entire sorted array
2. Find the middle element
3. Compare target with middle
4. Search left or right half accordingly
5. Repeat until found

## Code Implementation
```python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
```

## Time Complexity
- Best Case: O(1)
- Average/Worst Case: O(log n)

## Common Mistakes
❌ Using on unsorted arrays
❌ Integer overflow in mid calculation

## Key Takeaways
✓ Works only on sorted arrays
✓ O(log n) time - very efficient
✓ Divides search space in half each iteration
```

### Course-Specific Features

**For CS Subjects:**
- Time/space complexity analysis
- Algorithm implementations
- Data flow explanations
- Step-by-step execution

**For ECE Subjects:**
- Signal/hardware behavior
- Circuit descriptions
- Intuitive mathematics
- Conceptual explanations

---

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Recharts** for analytics visualization
- **Axios** for API calls
- **React Markdown** for formatted responses

### Backend Stack
- **Node.js** with Express
- **TypeScript** for type safety
- **Socket.IO** for real-time features
- **Serverless Functions** (Netlify/Vercel compatible)
- **CORS** enabled for cross-origin requests

### Key Features Implementation
- **API Key Management**: Browser localStorage with runtime validation
- **Study Timer**: React hooks with localStorage persistence
- **Quiz System**: Static question bank with randomization
- **Analytics**: Client-side calculation and visualization
- **Responsive Design**: Mobile-first Tailwind CSS

---

## 📁 Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ApiKeySetup.tsx
│   │   │   ├── PersonalizedInsights.tsx
│   │   │   ├── AIResponseBox.tsx
│   │   │   └── APIStatusIndicator.tsx
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── CoursesPage.tsx
│   │   │   ├── ChatPage.tsx
│   │   │   ├── QuizPage.tsx
│   │   │   └── AnalyticsPage.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   └── App.tsx
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── chat.ts
│   │   │   ├── courses.ts
│   │   │   ├── analytics.ts
│   │   │   └── quiz.ts
│   │   ├── services/
│   │   │   ├── aiProvider.ts
│   │   │   └── apiKeyManager.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── security.ts
│   │   │   └── inputValidation.ts
│   │   └── index.ts
│   └── package.json
│
└── README.md
```

---

## 🔌 API Endpoints

### Courses
- `GET /api/courses` - List all courses with details

### Chat (Requires API Keys)
- `POST /api/chat/message` - Send message to AI tutor
  - Body: `{ courseId, message, conversationId, apiKeys }`

### Analytics
- `GET /api/analytics/insights` - Get personalized learning insights
- `POST /api/analytics/timer/start` - Start study timer
- `POST /api/analytics/timer/stop` - Stop study timer

### Quiz
- `GET /api/quiz/questions` - Get quiz questions
- `POST /api/quiz/submit` - Submit quiz answers

---

## 🎯 Usage Guide

### 1. Browse Courses
- Navigate to "Explore Courses"
- Filter by category (CS/ECE) or difficulty
- Search for specific topics
- Click "Start Learning"

### 2. Chat with AI Tutor
- Select a course to open chat
- Ask questions about course topics
- Get structured, detailed explanations
- Follow up for deeper understanding

### 3. Track Your Progress
- Use the study timer on dashboard
- Select a topic before starting
- Timer tracks focused study time
- View peak focus hours

### 4. Take Custom Quizzes
- Navigate to "Custom Quiz"
- Choose category and topic
- Select difficulty and question count
- Get instant feedback with explanations

### 5. Manage API Keys
- Go to "API Settings"
- Add, edit, or remove API keys
- Toggle visibility for security
- Keys stored locally in browser

---

## 🌐 Deployment

### Netlify (Recommended)

1. Fork this repository
2. Connect to Netlify
3. Configure build settings:
   - Build command: `cd frontend && npm install && npm run build`
   - Publish directory: `frontend/build`
4. Deploy automatically

### Vercel

1. Import project to Vercel
2. Configure:
   - Framework: Create React App
   - Root directory: `frontend`
3. Deploy

### Manual Deployment

```bash
# Build frontend
cd frontend
npm run build

# Deploy the build folder to any static host
```

---

## 🔧 Configuration

### Environment Variables

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:5002
```

**Backend (.env):**
```env
PORT=5002
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/learning_copilot
JWT_SECRET=your-secret-key
GEMINI_MODEL=gemini-2.0-flash-exp
GROQ_MODEL=llama-3.3-70b-versatile
```

---

## 📊 Supported AI Providers

| Provider | Key Format | Get API Key |
|----------|------------|-------------|
| Google Gemini | `AIza...` | [Google AI Studio](https://makersuite.google.com/app/apikey) |
| Groq | `gsk_...` | [Groq Console](https://console.groq.com) |
| Anthropic Claude | `sk-ant-...` | [Anthropic Console](https://console.anthropic.com) |
| OpenRouter | `sk-or-v1-...` | [OpenRouter](https://openrouter.ai) |

---

## 🛡️ Security Features

- **No Server-Side Storage**: API keys never stored on servers
- **Local Encryption**: Keys stored securely in browser
- **HTTPS Only**: Secure communication
- **CORS Protection**: Restricted API access
- **Input Validation**: Sanitized user inputs
- **XSS Protection**: React's built-in safeguards
- **Runtime Key Validation**: Format checking before use

---

## 🐛 Troubleshooting

### API Keys Not Working
- Verify key is correct and active
- Check provider has sufficient credits
- Ensure provider name matches

### Courses Not Loading
- Check internet connection
- Clear browser cache
- Verify backend is running (if using full stack)

### Timer Not Saving
- Enable browser localStorage
- Check browser privacy settings

### Build Errors
- Delete `node_modules` and reinstall
- Clear npm cache: `npm cache clean --force`
- Use Node.js 18 or higher

---

## 📈 Future Enhancements

- [ ] MongoDB integration for persistent data
- [ ] User authentication and profiles
- [ ] Spaced repetition algorithm
- [ ] Collaborative learning features
- [ ] Mobile app (React Native)
- [ ] Video tutorial integration
- [ ] AI-generated practice problems
- [ ] Exam simulation mode
- [ ] Progress export (PDF/CSV)
- [ ] Leaderboards and achievements

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with React and TypeScript
- Styled with Tailwind CSS
- AI powered by your choice of providers (Gemini, Groq, Claude, OpenRouter)
- Icons by React Icons

---

## 📧 Contact

**Developer**: Kubendhiran V B

**GitHub**: [@KUBENDHIRAN-V-B](https://github.com/KUBENDHIRAN-V-B)

**Project Link**: [https://github.com/KUBENDHIRAN-V-B/PERSONALIZED-LEARNING-COPILOT-FOR-CORE-COURSES](https://github.com/KUBENDHIRAN-V-B/PERSONALIZED-LEARNING-COPILOT-FOR-CORE-COURSES)

---

**Built with ❤️ to help engineering students master core CS and ECE concepts**

For questions or support, please open an issue on GitHub.
