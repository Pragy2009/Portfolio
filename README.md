# Pragy Jha — Portfolio

Cybersecurity + Software Engineering portfolio. Next.js 14 (App Router) + Tailwind, with a Nodemailer-backed contact form. Features a terminal hero and a record-player project showcase (click a song tile, the vinyl spins, project detail pops up).

## Tech Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** for styling
- **Nodemailer** + Gmail SMTP for the contact form (no separate backend server)

## Project Structure

```
pragy-portfolio/
├── app/
│   ├── api/
│   │   └── contact/
│   │       └── route.ts        ← Nodemailer API endpoint (POST)
│   ├── globals.css             ← Tailwind + mode-cyber/swe styles + vinyl/needle CSS
│   ├── layout.tsx              ← Root layout, sets default mode class
│   └── page.tsx                ← Main page, holds mode state, assembles sections
├── components/
│   ├── Header.tsx              ← Sticky nav with CYBER/SWE mode toggle
│   ├── Terminal.tsx            ← Typewriter hero on the left
│   ├── RecordPlayer.tsx        ← Vinyl + needle + song tiles + project detail
│   ├── Skills.tsx              ← Cyber / SWE / Certifications / Achievements
│   ├── Projects.tsx            ← Filterable project grid (ALL / SECURITY_OPS / ARCHITECTURE)
│   └── Connect.tsx             ← Terminal-styled contact form
├── lib/
│   └── data.ts                 ← ALL content lives here — edit this file to update site
├── public/                     ← Drop static files here (resume.pdf, favicon, etc.)
├── .env.example                ← Template; copy to .env.local
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── tsconfig.json
```

## Setup — Run on localhost

### 1. Prerequisites

- **Node.js 18.17+** (`node --version` to check)
- A **Gmail account** with **2-Step Verification enabled**

### 2. Install dependencies

```bash
cd pragy-portfolio
npm install
```

### 3. Get a Gmail App Password

Nodemailer + Gmail requires an "App Password" — not your regular Gmail password.

1. Go to https://myaccount.google.com/security
2. Make sure **2-Step Verification** is ON (required to access App Passwords)
3. Go to https://myaccount.google.com/apppasswords
4. App: "Mail", Device: "Other (Portfolio)" — generate
5. Copy the 16-character password (e.g. `abcd efgh ijkl mnop`)

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

```
GMAIL_USER=your.email@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
CONTACT_TO=your.email@gmail.com
```

`.env.local` is gitignored — your secrets stay local.

### 5. Fill in your content

Open `lib/data.ts` and update:

- `profile.email`, `profile.github`, `profile.linkedin`, `profile.resume`
- Each project's `github` and `live` URLs (currently `null`; replace with strings to show the buttons)

Anything left as `null` will hide the corresponding button rather than show a dead link.

If you have a resume PDF, drop it at `public/resume.pdf`.

### 6. Run the dev server

```bash
npm run dev
```

Visit http://localhost:3000

### 7. Test the contact form

Submit the form. You should receive an email at `CONTACT_TO` within a few seconds. If not, check the terminal where `npm run dev` is running for error logs.

## Build for production

```bash
npm run build
npm start
```

## Push to GitHub

Once you've created an empty repo on GitHub (no README, no .gitignore, no license — the project already has them):

```bash
cd pragy-portfolio
git init
git add .
git commit -m "Initial commit: portfolio scaffold"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub values.

For subsequent updates:

```bash
git add .
git commit -m "Describe what changed"
git push
```

## Deploy to Vercel (recommended, free)

1. Push the repo to GitHub (above)
2. Go to https://vercel.com and import the repo
3. In Vercel project settings → Environment Variables, add:
   - `GMAIL_USER`
   - `GMAIL_APP_PASSWORD`
   - `CONTACT_TO`
4. Deploy

Vercel auto-redeploys on every `git push` to `main`.

## Customising

- **Colours**: edit `tailwind.config.js` (`cyber`, `swe` colour values) and the CSS variables in `app/globals.css`
- **Sections**: each section is its own component in `components/` — edit independently
- **New project**: append an object to the `projects` array in `lib/data.ts` — it appears automatically on the record player and in the grid
- **Switch sections**: edit the order in `app/page.tsx`
