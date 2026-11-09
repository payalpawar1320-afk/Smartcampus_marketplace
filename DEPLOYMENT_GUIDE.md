# 🚀 Deployment Guide: Smart Campus Marketplace

This guide walks you through deploying the **Smart Campus Marketplace** to **Render.com** for free 24/7 cloud hosting with your live Aiven MySQL database.

---

## 📋 Architecture Overview
- **Frontend**: React + Vite (compiled to static production bundle in `dist/`)
- **Backend**: Express.js REST API (`backend/server.js`)
- **Database**: Aiven Cloud MySQL with SSL encryption
- **Deployment Model**: Single Unified Web Service on Render (Express serves both the API and the React SPA frontend from one URL)

---

## 🛠️ Step 1: Push Code to GitHub

1. Open [GitHub](https://github.com/new) and click **New Repository**.
2. Name the repository: `smart-campus-marketplace`
3. Set visibility to **Public** or **Private** (both work on Render).
4. **Do NOT** initialize with a README, .gitignore, or license (we already have them).
5. Click **Create repository**.
6. In your terminal/PowerShell, run the following commands (replace `<YOUR_GITHUB_USERNAME>` with your GitHub username):

```bash
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/smart-campus-marketplace.git
git push -u origin main
```

---

## 🌐 Step 2: Deploy on Render.com

1. Go to [Render Dashboard](https://dashboard.render.com/) and sign in (you can sign in with GitHub).
2. Click the **New +** button in the top right and select **Web Service**.
3. Under **Connect a Git repository**, choose `smart-campus-marketplace` (if you don't see it, click *Configure account* to give Render access to your repository).
4. Fill in the service configuration:
   - **Name**: `smart-campus-marketplace`
   - **Region**: Choose closest (e.g., *Singapore* or *Oregon*)
   - **Branch**: `main`
   - **Root Directory**: *(leave blank)*
   - **Runtime**: `Node`
   - **Build Command**: 
     ```bash
     npm install && npm run build
     ```
   - **Start Command**: 
     ```bash
     npm start
     ```
   - **Instance Type**: **Free**

---

## 🔐 Step 3: Add Database Environment Variables

Scroll down to the **Environment Variables** section and click **Add Environment Variable**. Add the following keys and values:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production mode |
| `DB_HOST` | `mysql-1296ffec-satarakbp285-65d1.c.aivencloud.com` | Aiven Cloud MySQL host |
| `DB_USER` | `avnadmin` | Aiven MySQL username |
| `DB_PASSWORD` | `<your-database-password-from-.env>` | Aiven MySQL password |
| `DB_NAME` | `defaultdb` | MySQL database name |
| `DB_PORT` | `15999` | Aiven MySQL port |
| `DB_SSL` | `true` | Required for secure cloud connection |

---

## 🚀 Step 4: Click Deploy!

1. Click **Deploy Web Service** at the bottom.
2. Render will automatically:
   - Clone your repository
   - Install backend and frontend dependencies (`npm install`)
   - Build the production React bundle into `dist/` (`npm run build`)
   - Start the Express server (`npm start`)
3. Once the build completes (usually ~2 minutes), your service status will turn **Live** with a green checkmark!

---

## 🔗 Live URLs You Get:
- **Main Web Application**: `https://<your-service-name>.onrender.com/`
- **Live Database Console**: `https://<your-service-name>.onrender.com/db`
- **Health Check Endpoint**: `https://<your-service-name>.onrender.com/api/health`

