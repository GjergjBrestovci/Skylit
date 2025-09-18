# SkyLit.ai

SkyLit.ai is a powerful AI-powered website generator that transforms your ideas into functional, modern, responsive websites. Through an intuitive onboarding flow, users can specify their preferences for website type, design style, color scheme, and features, then watch as AI generates complete websites with HTML, CSS, and JavaScript.

## ✨ Features

- **🎨 Theme Selection**: Choose from 6 professional themes (3 dark, 3 light variations)
- **🛠️ Comprehensive Customization**: 6 website types, 12 color palettes, 8 design styles, 6 layouts
- **🤖 AI-Powered Generation**: Advanced AI creates functional websites with interactive JavaScript
- **👀 Live Preview**: Instant preview of generated websites with full functionality
- **🔐 Secure Authentication**: Supabase-powered user management with JWT tokens
- **📱 Mobile Responsive**: Fully responsive design that works on all devices

## 🚀 Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express (TypeScript)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with JWT
- **AI Service**: OpenRouter API (GPT-4o Mini)
- **Styling**: Custom dark theme with modern UI components

## 🎯 Current Status

Fully functional AI website generator with:
- ✅ Complete user authentication system
- ✅ Interactive onboarding flow with 6 customization steps
- ✅ AI-powered website generation with HTML/CSS/JavaScript
- ✅ Live preview system with JavaScript execution
- ✅ Theme selection and extensive customization options

## 🔧 API Endpoints

- `POST /api/auth/register` – User registration
- `POST /api/auth/login` – User authentication  
- `POST /api/auth/refresh` – Token refresh
- `POST /api/generate-site` – AI website generation
- `POST /api/preview-site` – Live website preview
- `GET /api/health` – Service health check

## 🗄️ Database Schema

**Users Table** (Supabase Auth):
- Managed by Supabase with built-in user profiles
- JWT-based authentication with automatic token refresh

**Projects Table**:
- `id`, `user_id`, `name`, `prompt`, `html_code`, `css_code`, `js_code`
- `website_type`, `color_palette`, `design_style`, `layout_type`
- `selected_pages`, `selected_features`, `theme`
- `created_at`, `updated_at`

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x (tested) or Node.js 20+ (recommended)
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/GjergjBrestovci/SkyLit.git
   cd SkyLit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Follow the detailed guide in `SUPABASE_SETUP.md`
   - Create a new Supabase project
   - Run the SQL schema from `backend/supabase_schema.sql`

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your credentials:
   ```env
   PORT=5000
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   JWT_SECRET=your_jwt_secret
   OPENROUTER_API_KEY=your_openrouter_api_key
   ```

5. **Start the development servers**
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

If you see a Node version error from Vite, ensure you're on Node 18.x or upgrade to Node 20+. This repo currently pins Vite 5.x for Node 18 compatibility.

## 📝 Available Scripts

- `npm run dev` – Start both frontend and backend in development mode
- `npm run start` – Alias for dev (for compatibility)
- `npm run dev:frontend` – Frontend only (Vite dev server)
- `npm run dev:backend` – Backend only (Express with ts-node-dev)

## 📁 Project Structure

```
SkyLit/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Auth.tsx     # Authentication component
│   │   │   ├── NewDashboard.tsx  # Main onboarding flow
│   │   │   └── WebsitePreview.tsx # Live preview component
│   │   └── utils/
│   │       └── apiClient.ts # API client with auto-refresh
├── backend/                 # Express + TypeScript backend
│   ├── controllers/         # Route handlers
│   ├── middleware/          # Auth and validation middleware
│   ├── routes/             # API route definitions
│   ├── services/           # Business logic
│   │   └── ai/             # AI service layer
│   │       ├── generateWebsite.ts    # Core AI generation
│   │       ├── promptEnhancer.ts     # Prompt optimization
│   │       └── modelProvider.ts      # AI model integration
│   ├── supabase.ts         # Supabase client setup
│   └── server.ts           # Express app entry point
├── .env.example            # Environment template
├── SUPABASE_SETUP.md      # Supabase configuration guide
└── README.md              # This file
```

## 🎨 How It Works

1. **Authentication**: Users sign up/login through Supabase Auth
2. **Onboarding Flow**: 6-step customization process:
   - Theme selection (dark/light variations)
   - Website type (portfolio, business, blog, etc.)
   - Color palette selection
   - Design style preferences
   - Layout configuration
   - Feature selection

3. **AI Generation**: Enhanced prompts sent to OpenRouter API for intelligent code generation
4. **Live Preview**: Generated websites rendered with full JavaScript functionality
5. **Code Output**: Clean, organized HTML, CSS, and JavaScript ready for deployment

## 🔧 Configuration

### Environment Variables
```env
# Server Configuration
PORT=5000

# Supabase Configuration
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key

# Authentication
JWT_SECRET=your_secure_jwt_secret

# AI Service
OPENROUTER_API_KEY=your_openrouter_key
```

### AI Model Configuration
- **Provider**: OpenRouter (or-gpt-4o-mini-2024-07-18)
- **Context**: Optimized prompts for web development
- **Output**: Structured HTML, CSS, and JavaScript generation

## 🛠️ Development

### Adding New Features
1. **Frontend Components**: Add to `frontend/src/components/`
2. **Backend Services**: Add to `backend/services/`
3. **AI Enhancements**: Modify `backend/services/ai/`
4. **Database Changes**: Update `backend/supabase_schema.sql`

### Code Standards
- **TypeScript**: Strict typing throughout
- **ESLint**: Code quality enforcement
- **Modular Architecture**: Clean separation of concerns
- **Environment Variables**: Secure configuration management

## 🚀 Deployment

The application is ready for deployment on platforms like:
- **Frontend**: Vercel, Netlify, or any static hosting
- **Backend**: Railway, Render, or any Node.js hosting
- **Database**: Supabase (already cloud-hosted)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- **Supabase** for authentication and database services
- **OpenRouter** for AI model access
- **Tailwind CSS** for styling framework
- **React + TypeScript** for robust frontend development
