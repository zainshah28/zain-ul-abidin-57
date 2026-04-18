# AI Study Companion Agent

A complete MERN stack app for planning study tasks, tracking performance, and getting AI-style rule-based suggestions.

## Project Structure

```
AI_Study_Companion/
  client/
    index.html
    package.json
    vite.config.js
    src/
      App.jsx
      index.css
      main.jsx
      components/
        Layout.jsx
        ProtectedRoute.jsx
        StatCard.jsx
      context/
        AuthContext.jsx
      pages/
        AISuggestionsPage.jsx
        DashboardPage.jsx
        LoginPage.jsx
        PerformancePage.jsx
        RegisterPage.jsx
        StudyPlannerPage.jsx
      services/
        api.js

  server/
    .env.example
    package.json
    src/
      app.js
      server.js
      config/
        db.js
      controllers/
        authController.js
        performanceController.js
        taskController.js
      data/
        sampleData.js
      middleware/
        authMiddleware.js
        errorMiddleware.js
      models/
        Quiz.js
        Task.js
        User.js
      routes/
        authRoutes.js
        performanceRoutes.js
        taskRoutes.js
      utils/
        aiEngine.js
```

## Features

- JWT auth (`/api/auth/register`, `/api/auth/login`)
- Study planner CRUD (`/api/tasks`)
- Quiz score tracking (`/api/quiz`)
- AI analysis (`/api/analysis`)
- Dashboard with cards + Chart.js progress chart
- Strong/weak subject analysis
- Procrastination risk detection

## AI Decision Rules

- If quiz average for a subject is `< 50`, mark as weak.
- If task `studyHours < STUDY_HOURS_THRESHOLD`, suggest increasing study time.
- If deadline is within 24 hours and task is pending, generate procrastination-risk suggestion.
- Productivity score uses completion rate + consistency across last 7 days.
- Performance score is average of quiz scores.

## Setup

1. Install Node.js 18+ and npm.
2. Configure backend environment:

```bash
cd server
cp .env.example .env
```

3. Install dependencies:

```bash
cd server
npm install
cd ../client
npm install
```

4. Start backend and frontend in separate terminals:

```bash
cd server
npm run dev
```

```bash
cd client
npm run dev
```

5. Seed sample data (optional):

```bash
cd server
npm run seed
```

Sample seeded account:
- Email: `demo@student.com`
- Password: `password123`

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Study
- `POST /api/tasks`
- `GET /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

### Performance
- `POST /api/quiz`
- `GET /api/analysis`
