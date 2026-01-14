# 🎓 Personalized Learning Copilot

An AI-powered adaptive learning platform for engineering students to master Computer Science and Electronics & Communication Engineering concepts through intelligent tutoring, real-time progress tracking, and personalized study recommendations.

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![Netlify](https://img.shields.io/badge/Deployed-Netlify-00C7B7?logo=netlify)

## ✨ Features

### 🤖 AI-Powered Learning
- **Bring Your Own API Keys**: Use your own AI provider keys (OpenAI, Gemini, Claude, etc.)
- **Multi-Provider Support**: Add multiple API keys for redundancy
- **Context-Aware Responses**: Get explanations tailored to your learning level
- **Markdown Formatting**: Code examples and structured explanations

### 📚 Comprehensive Course Library
- **35+ Courses**: Covering CS and ECE core subjects
- **Computer Science**: DSA, DBMS, OS, Networks, Algorithms, ML, AI, Web Dev, Cloud, Security
- **Electronics & Communication**: Digital Electronics, Signals & Systems, Communication Systems, VLSI, Embedded Systems
- **Difficulty Levels**: Beginner, Intermediate, and Advanced courses
- **Topic-Based Learning**: Each course broken down into key topics

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

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org))
- Your own AI API key (OpenAI, Google Gemini, Anthropic Claude, etc.)

### Installation

```bash
# Clone the repository
git clone https://github.com/KUBENDHIRAN-V-B/PERSONALIZED-LEARNING-COPILOT-FOR-CORE-COURSES.git
cd "PERSONALIZED LEARNING COPILOT FOR CORE COURSES"

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies (optional for local development)
cd ../backend
npm install
```

### Running Locally

**Frontend Only (Recommended):**
```bash
cd frontend
npm start
```
Access at: http://localhost:3000

**Full Stack (Optional):**
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
3. Click "Add Another API Key" to add your AI provider keys
4. Enter:
   - **Provider Name**: e.g., "OpenAI", "Gemini", "Claude"
   - **API Key**: Your actual API key
5. Click "Save & Continue"
6. Start learning!

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Recharts** for analytics visualization
- **Axios** for API calls
- **React Markdown** for formatted responses

### Backend Stack (Serverless)
- **Netlify Functions** for API endpoints
- **Node.js** runtime
- **Express-style** routing
- **CORS** enabled for cross-origin requests

### Key Features Implementation
- **API Key Management**: Browser localStorage with encryption
- **Study Timer**: React hooks with localStorage persistence
- **Quiz System**: Static question bank with randomization
- **Analytics**: Client-side calculation and visualization
- **Responsive Design**: Mobile-first Tailwind CSS

## 📁 Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ApiKeySetup.tsx          # API key configuration
│   │   │   ├── PersonalizedInsights.tsx # Study timer & analytics
│   │   │   └── APIStatusIndicator.tsx   # API health display
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx        # Main dashboard
│   │   │   ├── CoursesPage.tsx          # Course catalog
│   │   │   ├── ChatPage.tsx             # AI tutor interface
│   │   │   ├── QuizPage.tsx             # Quiz builder
│   │   │   └── AnalyticsPage.tsx        # Progress tracking
│   │   ├── services/
│   │   │   └── api.ts                   # API client
│   │   └── App.tsx                      # Main app component
│   └── package.json
│
├── netlify/
│   └── functions/
│       └── api.js                       # Serverless API endpoints
│
├── netlify.toml                         # Netlify configuration
└── README.md
```

## 🔌 API Endpoints

### Courses
- `GET /api/courses` - List all courses with details

### Analytics
- `GET /api/analytics/insights` - Get personalized learning insights

### Chat (Requires API Keys)
- `POST /api/chat/message` - Send message to AI tutor
  - Body: `{ message: string, apiKeys: ApiKey[] }`

## 🎯 How to Use

### 1. Browse Courses
- Navigate to "Explore Courses" from dashboard
- Filter by category (CS/ECE) or difficulty
- Search for specific topics
- Click "Start Learning" to begin

### 2. Chat with AI Tutor
- Select a course to open the chat interface
- Ask questions about course topics
- Get code examples and explanations
- AI responds based on your configured API keys

### 3. Track Your Progress
- Use the study timer on the dashboard
- Select a topic before starting
- Timer tracks your focused study time
- View peak focus hours and recommendations

### 4. Take Custom Quizzes
- Navigate to "Custom Quiz"
- Choose category (CS or ECE)
- Select topic and difficulty
- Set number of questions (3-20)
- Get instant feedback with explanations

### 5. Manage API Keys
- Go to "API Settings" from dashboard
- Add, edit, or remove API keys
- Toggle visibility for security
- Keys are stored locally in your browser

## 🌐 Deployment

### Netlify (Recommended)

The app is configured for one-click Netlify deployment:

1. Fork this repository
2. Connect to Netlify
3. Deploy automatically
4. Access your live URL

**Live Demo**: [Your Netlify URL]

### Manual Deployment

```bash
# Build frontend
cd frontend
npm run build

# Deploy the build folder to any static host
# Netlify, Vercel, GitHub Pages, etc.
```

## 🔧 Configuration

### Environment Variables (Optional)

Create `.env` in frontend directory:

```env
REACT_APP_API_URL=https://your-api-url.com
```

### Netlify Configuration

The `netlify.toml` file handles:
- Build commands
- API function routing
- SPA redirects
- CORS headers

## 📊 Supported AI Providers

The app works with any AI provider that has a compatible API:

- **OpenAI** (GPT-3.5, GPT-4)
- **Google Gemini** (Gemini Pro, Gemini Flash)
- **Anthropic Claude** (Claude 3)
- **Groq** (Llama models)
- **Any OpenAI-compatible API**

## 🛡️ Security Features

- **No Server-Side Storage**: API keys never touch our servers
- **Local Encryption**: Keys stored securely in browser
- **HTTPS Only**: Secure communication
- **CORS Protection**: Restricted API access
- **Input Validation**: Sanitized user inputs
- **XSS Protection**: React's built-in safeguards

## 🐛 Troubleshooting

### API Keys Not Working
- Verify key is correct and active
- Check provider has sufficient credits
- Ensure provider name matches (case-insensitive)

### Courses Not Loading
- Check internet connection
- Clear browser cache
- Verify Netlify functions are deployed

### Timer Not Saving
- Enable browser localStorage
- Check browser privacy settings
- Try incognito mode to test

### Build Errors
- Delete `node_modules` and reinstall
- Clear npm cache: `npm cache clean --force`
- Use Node.js 18 or higher

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

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Built with React and TypeScript
- Styled with Tailwind CSS
- Deployed on Netlify
- AI powered by your choice of providers

---

**Built with ❤️ to help engineering students master core CS and ECE concepts**

For questions or support, please open an issue on GitHub.
