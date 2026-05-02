<!-- # "Jobify" Readme File # -->
# 💼 Welcome to Jobify - Find Your Dream Job 💼

Jobify is a simple, full-stack job portal application built with Java Spring Boot (backend), MongoDB (data store), Clerk (authentication), and Next.js (frontend). It allows recruiters to post jobs and candidates to apply, with a clean and beginner-friendly codebase.

---

## 🚀 Live Deployments

- 🌐 **Frontend (Vercel)**  
  👉 https://your-jobify.vercel.app

- ⚙️ **Backend (Render)**  
  👉 https://your-jobify-api.onrender.com

---

## Tech Stack

- **Backend:** Java (Spring Boot)
- **Database:** MongoDB
- **Auth:** Clerk
- **Frontend:** Next.js

---

## Key Features

- **Two User Roles:** Recruiter and Candidate
- **Recruiter Features:**
  - Post new job openings
  - View all posted jobs
  - View applicants for each job
  - Accept/Reject applications
- **Candidate Features:**
  - Browse all available jobs
  - Apply to jobs with cover letter
  - Track application status
- User management via Clerk webhooks
- MongoDB for reliable data storage
- Clean, responsive UI with Tailwind CSS

---

## Project Structure (high level)

- `Server/Java/` — Java Spring Boot backend, API handlers, services, and MongoDB integration
- `Client/` — Next.js frontend, components, and Clerk auth routes
- `README.md` — This file

---

## Quick Start

Prerequisites:

- Java 17+ and Maven 3.6+ installed
- MongoDB accessible (local or hosted - MongoDB Atlas recommended)
- Clerk account and API keys (for auth)
- Node.js 18+ installed (for frontend)

### 1. Clone the repo

```bash
mkdir Jobify
cd Jobify
git clone https://github.com/<your-github-username>/Jobify.git .
```

### 2. Configure application settings

Before running the app locally or deploying, make sure your runtime configuration is in place:

- **Local development:** copy `Server/Java/.env.example` to `Server/Java/.env` and `Client/.env.example` to `Client/.env`, then open those files and fill in values specific to your environment.

- **Production:** configure required settings and secrets in your hosting platform's environment manager (Vercel, Render, etc.).

### 3. Run the backend

```bash
cd Server/Java
mvn clean package -DskipTests
java -jar target/jobify-1.0.0.jar
```

Or using Maven directly:

```bash
cd Server/Java
mvn spring-boot:run
```

The backend runs on `http://localhost:3001` by default.

### 4. Run the frontend

```bash
cd Client
npm install
npm run dev
```

The frontend runs on `http://localhost:3000` by default.

---

## API Endpoints

Base URL: `/api/v1`

### User Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/user/webhook` | Clerk webhook for user events |
| PUT | `/user/role` | Set user role (RECRUITER/CANDIDATE) |
| GET | `/user` | Get current user details |

### Job Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/job` | Create a new job (Recruiter) |
| GET | `/job/list` | Get all jobs |
| GET | `/job/my-jobs` | Get jobs by recruiter |
| GET | `/job/{jobId}` | Get job by ID |
| DELETE | `/job/{jobId}` | Delete a job (Recruiter) |

### Application Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/application` | Apply to a job (Candidate) |
| GET | `/application/job/{jobId}` | Get applications for a job (Recruiter) |
| GET | `/application/my-applications` | Get my applications (Candidate) |
| PUT | `/application/{id}/status?status=X` | Update application status (Recruiter) |

### Headers
- `clerk-user-id`: Required for authenticated endpoints

---

## Clerk Webhook Setup

1. Go to your Clerk Dashboard
2. Navigate to **Webhooks**
3. Create a new webhook endpoint: `https://your-backend-url/api/v1/user/webhook`
4. Subscribe to events:
   - `user.created`
   - `user.deleted`

---

## Deployment

### Vercel (Frontend)

1. Create a Vercel project and connect it to this repository
2. Set the Project Root to `Client`
3. Build command: `npm run build`
4. Configure environment variables in Vercel Dashboard
5. Deploy

### Render (Backend)

1. Create a new Web Service on Render
2. Set the root directory to `Server/Java`
3. Build command: `mvn clean package -DskipTests`
4. Start command: `java -jar target/jobify-1.0.0.jar`
5. Configure environment variables
6. Deploy

---

## Development Tips

- Test the API using tools like Postman or cURL
- Ensure Clerk webhooks point to your server's `/api/v1/user/webhook` endpoint
- Check MongoDB connection string is correct
- Run `mvn clean compile` to check for backend compile errors

---

## Contributing

Contributions welcome — open issues or submit PRs:

1. Fork the repo
2. Create a feature branch
3. Make changes and test locally
4. Open a PR with a clear description

---

## License

This project uses the MIT License. Feel free to adapt as needed.

---

## Acknowledgments

Built with ❤️ for learning purposes. This is a beginner-friendly project to understand full-stack development with Spring Boot and Next.js.

---
