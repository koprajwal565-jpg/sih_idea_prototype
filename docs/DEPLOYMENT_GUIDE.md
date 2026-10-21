# FixNear — Complete Cloud Deployment Guide (Vercel, Supabase & Render)

This guide takes you step-by-step through deploying FixNear into production on 100% free-tier cloud platforms.

---

## 📋 Overview of Deployment Architecture

| Component | Platform | Free Tier Limits |
|---|---|---|
| **Frontend** | [Vercel](https://vercel.com) | Unlimited deployments, 100GB bandwidth/mo |
| **Backend API** | [Render](https://render.com) or [Railway](https://railway.app) | 750 free instance hours/month |
| **Database & Storage** | [Supabase](https://supabase.com) | 500MB PostgreSQL, 1GB Storage, 50,000 active users |
| **Payment Gateway** | [Razorpay](https://dashboard.razorpay.com) | Free sandbox/test mode (no transaction fees) |

---

## Step 1: Set Up Supabase (Database & RLS)

1. Go to [supabase.com](https://supabase.com) and click **"Start your project"** (Sign in with your GitHub account).
2. Click **"New Project"**:
   - **Name:** `fixnear-db`
   - **Database Password:** Enter a secure password (save it safely).
   - **Region:** Select **South Asia (Mumbai)** for lowest latency in India.
   - **Pricing Plan:** Select **Free ($0/month)**.
3. Once the database provisions (takes ~60 seconds), go to the **SQL Editor** tab on the left sidebar:
   - Click **"New Query"**.
   - Copy and paste the contents of [`supabase/migrations/001_initial_schema.sql`](file:///c:/Users/PRAJWAL%20K%20O/Documents/project/supabase/migrations/001_initial_schema.sql) and click **"Run"**.
   - Repeat for [`supabase/migrations/002_rls_policies.sql`](file:///c:/Users/PRAJWAL%20K%20O/Documents/project/supabase/migrations/002_rls_policies.sql) (sets up Row Level Security).
   - Repeat for [`supabase/migrations/003_indexes_and_triggers.sql`](file:///c:/Users/PRAJWAL%20K%20O/Documents/project/supabase/migrations/003_indexes_and_triggers.sql) (anti-double-booking & triggers).
   - Repeat for [`supabase/migrations/004_seed_data.sql`](file:///c:/Users/PRAJWAL%20K%20O/Documents/project/supabase/migrations/004_seed_data.sql) (populates categories, services, and Bangalore providers).
4. Get your API credentials:
   - Navigate to **Project Settings** (gear icon) &rarr; **API**.
   - Copy **Project URL** (e.g. `https://xyzcompany.supabase.co`).
   - Copy **`anon` `public` key**.
   - Copy **`service_role` `secret` key** (keep this confidential).

---

## Step 2: Push Codebase to GitHub

1. Open [github.com/new](https://github.com/new) in your browser.
2. Create a repository named `fixnear` (Public or Private).
3. Connect your local workspace to GitHub by running in your terminal:
   ```powershell
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/fixnear.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 3: Deploy Backend on Render (Free Tier)

1. Sign up or log in at [render.com](https://render.com) using your GitHub account.
2. Click **"New +"** in the top right &rarr; Select **"Web Service"**.
3. Choose **"Build and deploy from a Git repository"** & select your `fixnear` repository.
4. Fill in the service configuration:
   - **Name:** `fixnear-backend`
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. Under **Environment Variables**, add the following:
   - `PORT` = `5000`
   - `NODE_ENV` = `production`
   - `SUPABASE_URL` = *(Your Supabase Project URL from Step 1)*
   - `SUPABASE_SERVICE_ROLE_KEY` = *(Your Supabase service_role key from Step 1)*
   - `ENABLE_DEMO_PAYMENT_MODE` = `true`
   - `CLIENT_URL` = `https://your-frontend.vercel.app` *(update after Step 4)*
6. Click **"Deploy Web Service"**.
7. Once deployment finishes, copy your live backend URL (e.g. `https://fixnear-backend.onrender.com`).
   - Test it by visiting: `https://fixnear-backend.onrender.com/health` (should return `{"status":"ok"}`).

---

## Step 4: Deploy Frontend on Vercel

1. Log in at [vercel.com](https://vercel.com) using your GitHub account.
2. Click **"Add New..."** &rarr; Select **"Project"**.
3. Import your `fixnear` GitHub repository.
4. In the configuration screen:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click "Edit" and choose `client`.
   - **Build & Output Settings:** Leave default (Vercel automatically detects [`client/vercel.json`](file:///c:/Users/PRAJWAL%20K%20O/Documents/project/client/vercel.json)).
5. Under **Environment Variables**, add:
   - `VITE_API_URL` = *(Your live Render backend URL from Step 3, e.g. `https://fixnear-backend.onrender.com`)*
6. Click **"Deploy"**.
7. Vercel will build the frontend and provide your live URL (e.g. `https://fixnear.vercel.app`).

---

## Step 5: Post-Deployment Verification

1. **Verify Backend Health:**
   ```bash
   curl https://fixnear-backend.onrender.com/health
   ```
2. **Open Frontend URL:**
   - Browse the home page and service catalog.
   - Test the **"AI Problem Helper"** with a test query ("Split AC cooling problem").
   - Book a test service and complete payment via **"Pay (Demo Mode)"**.
   - Switch viewing role to **"Pro / Tech"** and mark the job *On The Way* &rarr; *Completed*.
   - Switch viewing role to **"Admin"** and verify live GMV metrics.
