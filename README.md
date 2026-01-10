# 🎓 Personalized Learning Copilot

An AI-powered adaptive learning platform for engineering students to master core Computer Science and Electronics & Communication Engineering concepts through intelligent tutoring, real-time progress tracking, and personalized study recommendations.

![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-9.1-green?logo=mongodb)
![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-orange?logo=google)

## ✨ Key Features

### 🤖 AI-Powered Chat Tutor
- Context-aware responses using Google Gemini 2.0 Flash
- Multi-provider fallback (Groq, Cerebras, OpenRouter)
- Markdown-formatted explanations with code examples
- Socratic method for guided learning
- Rate limiting (30 requests/minute per user)

### 📊 Personalized Learning Analytics
- Real-time mastery tracking with visual progress bars
- Study session logging and performance metrics
- Peak focus time detection and customization
- Optimal session duration recommendations
- Weekly improvement tracking

### ⏱️ Study Tools
- Built-in study timer with start/stop functionality
- Focus mode with distraction prevention
- Session accuracy and focus score tracking
- Automatic mastery updates after practice

### 📚 Material Upload & AI Chat
- Upload study materials (PDF, DOC, TXT, MD)
- AI-powered document analysis and Q&A
- Context-aware responses based on uploaded content
- Support for multiple file formats
- Secure file storage and management

### 📚 Comprehensive Course Coverage

**Computer Science (20+ Courses)**
- Data Structures & Algorithms
- Database Management Systems
- Operating Systems
- Computer Networks
- Software Engineering
- Theory of Computation
- Compiler Design
- Machine Learning & AI
- Cloud Computing
- Cybersecurity
- And more...

**Electronics & Communication Engineering (15+ Courses)**
- Digital Electronics
- Signals & Systems
- Communication Systems
- Electromagnetic Theory
- Control Systems
- Microprocessors & Microcontrollers
- VLSI Design
- Embedded Systems
- Digital Signal Processing
- Optical & Wireless Communication
- And more...

### 🎯 Custom Quiz Builder
- Category-based filtering (CS or ECE)
- 30+ topics with multiple difficulty levels
- Customizable question count (3-20 questions)
- Real-time timer with progress tracking
- Detailed results with explanations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org))
- MongoDB Atlas account ([Free tier](https://www.mongodb.com/atlas))
- Google Gemini API key ([Get here](https://aistudio.google.com/apikey))
- Optional: Groq API key ([Get here](https://console.groq.com/keys))

### Installation

```bash
cd "PERSONALIZED LEARNING COPILOT FOR CORE COURSES"

# Backend setup
cd backend
npm install

# Frontend setup
cd ../frontend
npm install
```

### Environment Configuration

Create `.env` in `backend/` directory:

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/learning_copilot

# Authentication
JWT_SECRET=your-secret-key-change-in-production

# AI Providers
GOOGLE_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=30
RATE_LIMIT_WINDOW_MS=60000
```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Access at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🏗️ Architecture

### Frontend Stack
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Recharts** - Analytics visualization
- **Socket.io Client** - Real-time updates
- **Axios** - HTTP client with caching

### Backend Stack
- **Node.js + Express** - API server
- **TypeScript** - Type safety
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication
- **Socket.io** - Real-time communication
- **Helmet** - Security headers
- **Compression** - Response optimization

### AI Integration
- **Google Gemini 2.0 Flash** - Primary LLM
- **Groq Llama 3.3** - Fallback provider
- **Custom prompt engineering** - Course-specific responses
- **Multi-provider failover** - Automatic fallback on quota limits

## 📁 Project Structure

```
backend/
├── src/
│   ├── index.ts              # Express server & Socket.io setup
│   ├── routes/
│   │   ├── chat.ts           # AI chat with multi-provider support
│   │   ├── analytics.ts      # Mastery tracking & insights
│   │   ├── courses.ts        # Course management
│   │   ├── learning.ts       # Learning profiles
│   │   ├── materials.ts      # Material upload & management
│   │   └── auth.ts           # Authentication
│   ├── models/
│   │   ├── User.ts           # User schema
│   │   └── Material.ts       # Material schema
│   └── middleware/
│       ├── auth.ts           # JWT verification
│       └── errorHandler.ts   # Error handling
└── package.json

frontend/
├── src/
│   ├── App.tsx               # Main app router
│   ├── pages/
│   │   ├── DashboardPage.tsx # Learning dashboard
│   │   ├── ChatPage.tsx      # AI tutor interface
│   │   ├── CoursesPage.tsx   # Course selection
│   │   ├── QuizPage.tsx      # Custom quiz builder
│   │   ├── MaterialsPage.tsx # Material upload & management
│   │   └── AnalyticsPage.tsx # Progress analytics
│   ├── components/
│   │   ├── PersonalizedInsights.tsx  # Insights & timer
│   │   ├── AIResponseBox.tsx         # Chat responses
│   │   ├── FocusTimer.tsx            # Study timer
│   │   └── APIStatusIndicator.tsx    # API health
│   ├── services/
│   │   └── api.ts            # Axios client with caching
│   └── store/                # Redux state
└── package.json
```

## 🔌 API Endpoints

### Chat
- `POST /api/chat/message` - Send message to AI tutor
- `GET /api/chat/history/:conversationId` - Get conversation history
- `GET /api/chat/conversations` - List user conversations

### Analytics
- `GET /api/analytics/insights` - Get learning insights & recommendations
- `POST /api/analytics/timer/start` - Start study session
- `POST /api/analytics/timer/stop` - End study session & update mastery
- `GET /api/analytics/timer/status` - Get active timer status
- `POST /api/analytics/mastery/update` - Update topic mastery
- `POST /api/analytics/preferences/focus-time` - Set peak focus hours
- `POST /api/analytics/preferences/mastery-goal` - Set mastery goals
- `GET /api/analytics/dashboard` - Get analytics dashboard
- `GET /api/analytics/exam-readiness/:courseId` - Get exam readiness score

### Materials
- `POST /api/materials/upload` - Upload study material
- `GET /api/materials` - List user's materials
- `GET /api/materials/:id` - Get specific material
- `DELETE /api/materials/:id` - Delete material

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course details

## 🎯 How It Works

1. **Select Course** - Choose from 35+ CS and ECE courses
2. **Upload Materials** - Upload your study documents (PDF, DOC, TXT, MD)
3. **Chat with AI** - Ask questions about courses or uploaded materials
4. **Get Adaptive Responses** - AI provides explanations tailored to your level
5. **Track Progress** - View mastery levels for each topic
6. **Study with Timer** - Use built-in timer to track focused study sessions
7. **Get Insights** - Receive personalized recommendations based on performance
8. **Take Custom Quiz** - Test knowledge with category-based quizzes
9. **Set Goals** - Configure peak focus times and mastery targets

## 🔧 Development Scripts

**Backend:**
```bash
npm run dev      # Start with hot reload
npm run build    # Compile TypeScript
npm start        # Run production build
npm test         # Run tests
npm run lint     # Run ESLint
```

**Frontend:**
```bash
npm start        # Development server
npm run build    # Production build
npm test         # Run tests
```

## 📊 Data Flow

```
User Input
    ↓
Frontend (React)
    ↓
API Request (Axios)
    ↓
Backend (Express)
    ↓
Rate Limit Check
    ↓
Course Validation
    ↓
AI Provider Selection
    ↓
Gemini/Groq API
    ↓
Response Processing
    ↓
Mastery Update
    ↓
Socket.io Broadcast
    ↓
Frontend Update
```

## 🔐 Security Features

- JWT authentication for user sessions
- Rate limiting (30 requests/minute per user)
- Input validation on all endpoints
- Authorization checks on sensitive endpoints
- CORS configuration for localhost:3000
- Helmet security headers
- Password hashing with bcryptjs
- XSS protection in frontend components
- Error handling middleware
- Defensive programming with null safety checks

## ⚠️ Important Notes

### API Quotas
- **Gemini**: 1,500 requests/day (free tier)
- **Groq**: 14,400 requests/day (free tier)
- **Cerebras**: 1,000 requests/day (free tier)

### Database
- MongoDB Atlas free tier: 512MB storage
- Whitelist your IP in Atlas security settings

### Deployment
- Backend: Vercel, Netlify Functions, or self-hosted
- Frontend: Vercel, Netlify, or any static host
- Environment variables required for production

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection fails | Verify MONGODB_URI and IP whitelist in Atlas |
| Gemini quota exceeded | Wait for daily reset or use Groq fallback |
| CORS errors | Ensure backend runs on port 5000 |
| Chat not responding | Check API keys and rate limits |
| Mastery not updating | Verify timer stop endpoint is called |
| Quiz not loading | Check course data and topic configuration |

## ✅ Features Implemented

- ✅ Multi-provider AI support with automatic failover
- ✅ Real-time mastery tracking and updates
- ✅ Personalized learning insights and recommendations
- ✅ Study timer with focus score tracking
- ✅ Peak focus time detection and customization
- ✅ 35+ courses across CS and ECE disciplines
- ✅ Custom quiz builder with difficulty levels
- ✅ Material upload and AI-powered document chat
- ✅ Rate limiting and security middleware
- ✅ Socket.io real-time updates
- ✅ Responsive UI with Tailwind CSS
- ✅ Comprehensive error handling
- ✅ Authorization checks on all sensitive endpoints
- ✅ Input validation and XSS protection

## 🚀 Future Enhancements

- MongoDB persistence for all data
- User authentication and profiles
- Spaced repetition algorithm
- Collaborative learning features
- Mobile app (React Native)
- Video tutorials integration
- Practice problem generation
- Exam simulation mode
- Progress export (PDF/CSV)
- Leaderboards and achievements

## 📄 License

MIT License - See LICENSE file for details

---

Built with ❤️ to help engineering students master core CS and ECE concepts.
