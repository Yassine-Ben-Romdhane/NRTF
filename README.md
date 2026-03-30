# NRTF 3.0

**National Retech Fusion 3.0** — official conference website built with Next.js 14, Tailwind CSS, and Framer Motion.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Registration storage:** Google Sheets via service account

## Local Development

1. Clone the repo
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy the environment template and fill in your credentials:

   ```bash
   cp .env.example .env.local
   ```

4. Run the dev server:

   ```bash
   npm run dev
   ```

## Environment Variables

See `.env.example` for the full list. You need a Google Cloud service account with access to the Google Sheets API.

## Deployment (Vercel)

1. Push this repo to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Add your environment variables from `.env.local` in the Vercel dashboard under **Settings → Environment Variables**
4. Deploy — Vercel auto-detects Next.js, no config needed

## Project Structure

```
app/
  api/register/     # Registration API (POST → Google Sheets)
  layout.tsx
  page.tsx
components/
  layout/           # Navbar, Footer
  sections/         # Page sections (Hero, About, Schedule, etc.)
  ui/               # Reusable UI components
public/             # Static assets (logo, fonts, video)
data/               # Local data files
```
