<!-- # "Jobify" Readme File # -->
# 🕸️ Welcome to Jobify - Modern Job Portal 🕸️

Jobify is a simple, full-stack job portal application built with Java Spring Boot (backend), MongoDB (data store), Clerk (authentication), and Next.js (frontend). It allows recruiters to post jobs and candidates to apply, with a clean and beginner-friendly codebase.

---

## 🚀 Live Deployments

- 🌐 **Frontend (Vercel)**  
  👉 https://usemyjobify.vercel.app

- ⚙️ **Backend (Render)**  
  👉 https://jobify-34qa.onrender.com

---

## Tech Stack

- **Backend:** Java (Spring Boot)
- **Database:** MongoDB
- **Auth:** Clerk
- **Frontend:** Next.js

---

## Key Features

- Two user roles: Recruiter and Candidate
- Recruiters can post jobs and manage applications
- Candidates can browse jobs and apply with cover letters
- Application status tracking (Pending, Accepted, Rejected)
- User management and authentication via Clerk
- MongoDB for reliable storage of users, jobs, and applications
- Next.js frontend with responsive UI and Clerk integration

---

## Project Structure (high level)

- `Server/` — Java Spring Boot backend, API handlers, services, and MongoDB integration
- `Client/` — Next.js frontend, components, and Clerk auth routes
- `README.md` — This file

---

## Quick Start

Prerequisites:

- Java 17+ and Maven 3.6+ installed
- MongoDB accessible (local or hosted)
- Clerk account and API keys (for auth)

1. Clone the repo

```bash
mkdir Jobify
cd Jobify
git clone https://github.com/<your-github-username>/Jobify.git .
```

2. Configure application settings (local & production)

Before running the app locally or deploying, make sure your runtime configuration is in place:

- Local development: copy `Server/.env.example` to `Server/.env` and `Client/.env.example` to `Client/.env`, then open those files and fill in values specific to your environment. Keep sensitive values out of version control.

- Production: configure required settings and secrets in your hosting platform's environment manager (Vercel, Render, etc.). Ensure callback/webhook URLs (for Clerk and other services) point to your deployed URLs.

Use the example files in `Server/.env.example` and `Client/.env.example` as the authoritative list of keys to provide; the README avoids enumerating individual variable names to keep configuration details centralized in the example files.

3. Run the backend

```bash
cd Server
mvn clean package -DskipTests
java -jar target/jobify-1.0.0.jar
```

Or using Maven directly:

```bash
cd Server
mvn spring-boot:run
```

4. Frontend: install and run

```bash
cd Client
npm install
npm run build 
npm run dev
```

The frontend typically runs on `http://localhost:3000` and the backend on `http://localhost:3001` (configurable).

---

## Common Endpoints

- API base: `/api/v1`
  - User webhook: `POST /api/v1/user/webhook` (Clerk)
  - Set user role: `PUT /api/v1/user/role`
  - Jobs CRUD: under `/api/v1/job`
  - Applications: under `/api/v1/application`

---

## Testing & Development Tips

- Use `curl -v http://localhost:3001/api/v1/job/list` to test job listing.
- Run `mvn compile` to check for backend compile errors.
- Ensure Clerk webhooks point to the server's `/api/v1/user/webhook` during integration.

---

## Deployment

Below are quick deployment flows for the frontend (Vercel) and backend (Render). These are minimal steps — adapt them for your environment and secrets manager.

- Vercel (Frontend)

  1. Create a Vercel project and connect it to this repository.
  2. Set the Project Root to `Client` (or import as a monorepo and point the app to `Client`).
  3. Build command: `npm run build`
  4. Output directory: leave default (Next.js handled by Vercel).
  5. Configure required settings and secrets in Vercel (Dashboard → Settings → Environment Variables).
  6. Deploy — Vercel will run builds on every push.

- Render (Backend)

  1. Create a new Web Service on Render and connect it to the repository.
  2. Set the root directory to `Server`.
  3. Environment & Build:
     - Build command: `mvn clean package -DskipTests`
     - Start command: `java -jar target/jobify-1.0.0.jar`
  4. Configure required settings and secrets in Render (Service settings → Environment).
  5. Deploy — Render will build and start the service; check logs for startup errors.

Tips:

- Use Vercel for the Next.js frontend (serverless/edge-optimized) and Render (or similar) for the Java backend.
- Keep production secrets in the platform's environment manager — never commit them.
- If using webhooks (Clerk), configure callback URLs in Clerk to point to your deployed `POST /api/v1/user/webhook` endpoint.

---

## Contributing

Contributions welcome — open issues or submit PRs. Follow these steps:

1. Fork the repo
2. Create a feature branch
3. Make changes and test locally:
   - Backend: `cd Server && mvn compile`
   - Frontend: `cd Client && npm run dev`
4. Open a PR with a clear description

---

## License

This project uses the license in the repository. Feel free to adapt as needed.

---

## Acknowledgments
Enjoy Jobify — deployment and CI-CD guidance have been added above. Open an issue or PR if you want badges, examples, or more detailed deployment templates.

---
