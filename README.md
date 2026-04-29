# 📄 AI Resume Analyzer — Frontend

A modern AI-powered web application built with **React + Vite** that helps users analyze resumes, calculate ATS scores, and match resumes with job descriptions.

---

## 🚀 Live Demo

👉 https://resumesanalyze.netlify.app

---

## 🧠 Product Overview

AI Resume Analyzer helps job seekers:

- Improve resume quality using ATS analysis
- Match resumes against job descriptions
- Identify missing skills and keywords
- Get AI-powered suggestions and insights
- Track resume history and results

---

## ✨ Features

- 📤 Upload resumes (PDF)
- 📊 ATS score analysis (keywords, formatting, structure)
- 🧾 Job Description (JD) matching
- 🔍 Missing skills detection
- 💡 AI-powered suggestions & insights
- 📁 Resume history tracking
- 🔄 Real-time status updates
- 🔐 JWT authentication
- 🎯 Modern UI/UX

---

## 🛠️ Tech Stack

- React
- Vite
- TanStack Query (React Query)
- Axios / Fetch API
- Tailwind CSS 

---

## 📂 Project Structure
src/
├── components/
├── pages/
├── hooks/
├── services/
├── utils/
├── assets/
├── App.tsx
└── main.tsx


---

## ⚙️ Environment Variables

Create a `.env` file:

VITE_API_URL=http://localhost:3000


> ⚠️ Must start with `VITE_`

---

## 🧪 Run Locally

### Install dependencies

npm install


### Start development server


npm run dev


> Server will start at http://localhost:5173

---

## 🏗️ Build

npm run build

---

## ⚡ Deployment

1. Run `npm run build`
2. Deploy the `dist` folder to your static hosting provider

---

## 📝 Scripts

npm run dev

npm run build

---

## 📞 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/register | Register new user |
| POST | /api/v1/auth/login | Login user |
| POST | /api/v1/auth/refresh | Refresh token |
| POST | /api/v1/resumes/upload | Upload resume |
| GET | /api/v1/resumes | Get all resumes |
| GET | /api/v1/resumes/:id | Get resume by ID |
| GET | /api/v1/resumes/:id/status | Get resume status |
| GET | /api/v1/resumes/:id/download | Download resume |
| DELETE | /api/v1/resumes/:id | Delete resume |
| GET | /api/v1/job-descriptions | Get all job descriptions |
| POST | /api/v1/job-descriptions | Create job description |
| GET | /api/v1/job-descriptions/:id | Get job description by ID |
| GET | /api/v1/job-descriptions/:id/matches | Get matches |
| DELETE | /api/v1/job-descriptions/:id | Delete job description |

---

## 🔐 Authentication

- JWT tokens are used for authentication
- Tokens are sent in the `Authorization: Bearer <token>` header
- Refresh tokens are stored in httpOnly cookies

---

## 🛡️ Security

- JWT authentication
- Password encryption
- Rate limiting
- Input validation
- File upload validation

---

## 📊 Analysis Structure

Resume Analysis:
{
  "overallScore": 85,
  "feedback": "Strong communication skills, but weak on technical keywords",
  "missingSkills": ["Python", "SQL"],
  "actionableSuggestions": [
    "Add Python projects to highlight backend skills",
    "Include SQL experience in work history"
  ],
  "keywordAnalysis": {
    "required": ["Python", "SQL", "Machine Learning"],
    "found": ["Java", "C++"],
    "missing": ["Python", "SQL"],
    "score": 60
  },
  "formattingAnalysis": {
    "isClean": true,
    "isATSFriendly": true,
    "issues": []
  },
  "sections": [
    {
      "name": "Summary",
      "score": 80,
      "missingKeywords": []
    },
    {
      "name": "Experience",
      "score": 90,
      "missingKeywords": []
    }
  ]
}

---

## 📋 Troubleshooting

If you see CORS errors:
- Ensure backend API is running
- Check `VITE_API_URL` in `.env`
- Verify backend allows your origin

If files won't upload:
- Check file size limits in backend
- Verify upload directory exists
- Check storage permissions

---

---

## 👥 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

MIT © 2026

---

## 📞 Support

For questions or issues, please open an issue in the repository.

---

## 🔗 Helpful Links

- Live Demo: https://resumesanalyze.netlify.app
- Backend Repo: https://github.com/yourusername/AI_Resume_analyzer_backend

---

---
