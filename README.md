# ⌨️ TypeSense

A web-based typing practice application that helps users improve their typing speed and accuracy through real-time tests, performance tracking, mistake analysis, and personalized recommendations.

---

## ✨ Features

### ⌨️ Typing Test

- Real-time typing feedback
- WPM and accuracy calculation
- Correct and incorrect character highlighting
- Timer-based typing tests

### 👤 User Accounts

- Save typing results
- View personal typing history

### 📊 Dashboard

- Average WPM & Accuracy
- Max WPM
- Recent test history
- Weak letter and weak word insights
- Personalized recommendation using Mistral AI

### 🥇 Leaderboard

- Public Leaderboards
    - Ranked by Max WPM
    - Ranked by Average WPM

---

## 📦 Project Structure

```txt
TypeSense/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── assets/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── dashboard/
│   │   │   ├── Dashboard.jsx
│   │   │   └── Recommendations.js
│   │   ├── leaderboard/
│   │   │   └── Leaderboard.jsx
│   │   └── typing/
│   │       ├── Stats.jsx
│   │       ├── TypingTest.jsx
│   │       ├── typingUtils.js
│   │       └── words.js
│   ├── lib/
│   │   └── supabase.js
│   └── styles/
│       └── index.css
├── supabase/
│   └── functions/
│       └── recommendations/
│           └──  index.ts
├── index.html
├── package.json
├── .env.example
├── vite.config.js
├── vercel.json
└── README.md
```

## 🗺️ Roadmap 

### 🤖 AI Recommendations
- Replace rule-based recommendations with AI-powered feedback ✔
- Analyze long-term typing patterns
- Detect weak letters, weak words, and slow character combinations
- Provide weekly improvement summaries

### 📱 Mobile Improvements
- Mobile-friendly typing test
- Mobile dashboard support

### 🏆 Social Features
- Public leaderboards ✔
- Friends leaderboard
- Shareable typing results

### 📈 Progress Graphs
- WPM progress graph
- Accuracy progress graph
- Mistake trend graph
- Weak letters and weak words over time
- Weekly improvement chart