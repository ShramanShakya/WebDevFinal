# How to Test the App

## Student Information

- **Student Name:** Shraman Shakya
- **Student ID:** 6712145

## Deployed URLs / Repositories

- Frontend: <https://web-dev-final-yvtk.vercel.app> — repo: <https://github.com/ShramanShakya/WebDevFinal> (folder `react-frontend/`)
- Backend: <https://web-dev-final-eta.vercel.app> — repo: <https://github.com/ShramanShakya/WebDevFinal> (folder `next-backend/`)
- Screen recording: <https://assumptionuniversity-my.sharepoint.com/:v:/g/personal/u6712145_au_edu/IQCtujzRU6ojQZoCwGMJO8suAegvmy2IEu1RS-HWUeYiMjE>

## Test Credentials

All test users share the password **`Password123!`**. Log in with username or email.

| Role    | Username   | Email                  |
|---------|------------|------------------------|
| Teacher | teacher1   | teacher1@example.com   |
| Teacher | teacher2   | teacher2@example.com   |
| Teacher | teacher3   | teacher3@example.com   |
| Student | student1   | student1@example.com   |
| Student | student2   | student2@example.com   |
| Student | student3   | student3@example.com   |

## Prerequisites

- Node.js 20+
- A MongoDB database (MongoDB Atlas free tier works)

## How to Run & Test

### 1. Backend Setup (`next-backend/`)

```bash
cd next-backend
npm install
cp .env.example .env.local     # then fill in MONGODB_URI, JWT_SECRET, FRONTEND_URL
node --env-file=.env.local scripts/seed.mjs   # creates the 6 test users + sample courses
npm run dev                    # http://localhost:3000
```

Environment variables (also set these in Vercel → Project → Settings → Environment Variables):

| Name           | Example                          | Notes                                    |
|----------------|----------------------------------|------------------------------------------|
| `MONGODB_URI`  | `mongodb+srv://...`              | Atlas connection string                  |
| `MONGODB_DB`   | `online_course`                  | optional, defaults to `online_course`    |
| `JWT_SECRET`   | long random string               |                                          |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` | CORS origin, no trailing slash. Local: `http://localhost:5174` |

### 2. Frontend Setup (`react-frontend/`)

```bash
cd react-frontend
npm install
cp .env.example .env           # VITE_API_URL=http://localhost:3000
npm run dev                    # http://localhost:5174
```

On Vercel set `VITE_API_URL` to the deployed backend URL (no trailing slash), and set each project's **Root Directory** to `next-backend` / `react-frontend`.

### 3. Testing Walkthrough

**Teacher** (`teacher1`):
1. Log in → "My Courses" shows only teacher1's courses.
2. "New Course" → create a course (name, duration, topics, price, max student, status).
3. View a course → detail page lists enrolled students.
4. Edit a course (including status Open/Close/Cancel).
5. Delete is disabled/rejected (409) when students are enrolled; works when empty.
6. Logged in as `teacher2`, opening one of teacher1's courses by URL returns 403.

**Student** (`student1`):
1. Log in → "All Courses" lists every course except `Cancel`.
2. Search by part of a course name or teacher name.
3. Open a course → "Enroll" works only when status is Open and seats remain.
4. Enrolling twice is rejected; Close courses and full courses cannot be enrolled.
5. "My Enrollments" lists the courses you joined.

**Backend rules (try with curl/Postman):** requests without the `token` cookie return 401; a Student calling `POST /api/course` gets 403; a Teacher calling `POST /api/course/:id/enroll` gets 403.

### API summary

| Method | Path | Who |
|---|---|---|
| POST | `/api/auth/login`, `/api/auth/logout` | public |
| GET | `/api/user`, `/api/user/:id` | self only |
| GET | `/api/course` (`?search=`, `?enrolled=true`) | Teacher: own courses · Student: non-Cancel courses |
| POST | `/api/course` | Teacher |
| GET | `/api/course/:id` | Teacher (own) / Student (non-Cancel) |
| PUT, DELETE | `/api/course/:id` | Teacher (own); delete only if nobody enrolled |
| POST | `/api/course/:id/enroll` | Student |
