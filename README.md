# A Little Universe for Shams Moni ✨

> **“One birthday. Hundreds of wishes. One little universe made just for Shams.”**

A premium, interactive birthday celebration web application dedicated to **Shams Moni**. Visitors can explore a constellation of wishes, craft an emotional "birthday star" with custom feelings and energies, send secret wishes, surprise Shams with random blessings, and view live stats of all stars created.

---

## 🌟 Highlights & Features

- **Landing Journey**: Cinematic entrance into Shams's Universe with starfield atmosphere.
- **Hero Section**: Live counter of all wishes in the database, birthday greetings, and quick CTAs.
- **Interactive "Create a Star for Shams"**:
  - Step 1: Choose a star type (Golden Star, Moon, Bloom, Sun, Blue Star, Shooting Star).
  - Step 2: Choose wish energy (Happiness, Success, Peace, Adventure, Love, Dreams, or custom feeling).
  - Step 3: Write heartfelt wish message (up to 500 characters with live counter).
  - Step 4: Add name or choose **Anonymous** mode ("Someone who wishes you well").
  - Step 5: Magical launch animation with confetti burst and star release into the sky.
- **Wall of Wishes (Dual Mode)**:
  - **Cards Mode**: Filterable by energy, searchable by sender or message, responsive cards with star glyphs.
  - **Constellation Mode**: Interactive 2D celestial sky where each wish is a glowing star with tooltip preview and full-dialog modal.
- **Surprise Shams**: Modal drawer revealing a real random blessing pulled from PostgreSQL.
- **Individual Shareable Wish Page**: Dedicated route `/wish/:id` to share or view any star.
- **Countdown & Special Section**: Countdown to Shams's configured birthday and customized heartfelt blocks.
- **Ambient Celestial Sound**: Optional audio synthesizer tone generating a soothing cosmic chime without external copyrighted audio.
- **Backend Validation & Security**: Rate limiting (10 submissions per 10 mins per IP), sanitized inputs, parameterized queries, health check endpoint.

---

## 🚀 Render Deployment (Single Web Service + PostgreSQL)

This application is designed to run seamlessly as a single Render Web Service connected to Render Managed PostgreSQL:

### Step 1: Push Repository
Push this codebase to your GitHub or GitLab repository.

### Step 2: Create a PostgreSQL Database on Render
1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **PostgreSQL**.
3. Name it `shams-wishes-db` (or any name), select the Free plan, and click **Create Database**.
4. Once provisioned, copy the **Internal Database URL** (or External Database URL).

### Step 3: Create a Web Service
1. Click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name**: `little-universe-shams-moni`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: `Free`
4. In the **Environment Variables** section:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: Paste your PostgreSQL connection URL from Step 2.
5. Click **Create Web Service**.

### Step 4: Verification
Render will automatically build the React Vite bundle, start the Express backend on `0.0.0.0:${PORT}`, and automatically execute database schema migrations and initial seeding on first boot.
Verify the health endpoint:
```bash
curl https://<your-render-url>.onrender.com/api/health
# Response: {"status":"ok","timestamp":"..."}
```

Alternatively, use Render Blueprints by pointing Render to the included `render.yaml` file for one-click setup.

---

## 🛠️ Local Development

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Set your PostgreSQL connection URL in .env
# If omitted, a resilient in-memory development store with seed data is automatically used!
echo 'DATABASE_URL="postgres://user:password@localhost:5432/shams_db"' > .env

# 3. Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Customization Configuration

All recipient details, dates, headings, and options are centralized in:
`src/config/appConfig.ts`

You can customize:
- Recipient name: `"Shams Moni"`
- Birthday date: `"2026-10-15"`
- Hero messages & headings
- Available star types & energies
- Emotional "Why Shams is Special" cards
- Footer messages & maximum character limits
