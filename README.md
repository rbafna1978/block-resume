# BlockResume

BlockResume is a student-friendly, block-based resume builder.

- Edit resume sections visually
- Keep a consistent ATS-friendly LaTeX format
- Compile and preview PDFs directly in the app

## Highlights

- Safe LaTeX escaping for all user input
- JSON export/import for backup and versioning
- Multiple section types (education, experience, research, projects, hackathons, achievements, etc.)
- Works locally and in free-tier deployments

## Tech Stack

- Next.js 16
- React 18
- Tailwind CSS
- LaTeX compilation via Docker / Tectonic / TeX Live

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment (optional but recommended)

```bash
cp .env.example .env.local
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## PDF Compilation Modes

`POST /api/compile` supports these modes:

1. Docker (default)
2. Local `tectonic` (`USE_TECTONIC=1`)
3. Local TeX Live + `latexmk` (`USE_TEXLIVE=1`)

Automatic fallback is enabled by default:
`Docker -> tectonic -> texlive` (`AUTO_COMPILER_FALLBACK=1`).

## Environment Variables

| Variable | Purpose | Default |
|---|---|---|
| `LATEX_DOCKER_IMAGE` | Docker image for LaTeX compile | `texlive/texlive:latest` |
| `LATEX_DOCKER_PLATFORM` | Optional Docker platform override | unset |
| `USE_TECTONIC` | Force local tectonic | `0` |
| `USE_TEXLIVE` | Force local TeX Live | `0` |
| `AUTO_COMPILER_FALLBACK` | Fallback between compilers | `1` |
| `NEXT_PUBLIC_COMPILE_API_URL` | External compile API base URL (for split deploy) | unset |
| `CORS_ORIGIN` | Allowed browser origin for compile API | `*` |

## Free Deployment Options

### Option A: One-Service Deploy on Render (easiest)

Use this when you want everything (frontend + PDF compile API) in one place.

1. Push this repo to GitHub.
2. In Render, create a new **Web Service** from the repo.
3. Keep Docker deploy enabled (`render.yaml` is already included).
4. Deploy.

This works well because the Docker image includes Node + TeX tools.

### Option B: Vercel (frontend) + Render (PDF compile backend) (recommended for free Vercel usage)

Vercel is great for the frontend, but PDF compilation requiring Docker/LaTeX binaries is better hosted on Render.

#### Step 1: Deploy compiler backend to Render

1. Create a Render Web Service from this repo.
2. Keep default Docker setup.
3. Set env vars in Render:
   - `CORS_ORIGIN=https://YOUR-VERCEL-DOMAIN.vercel.app`
4. Deploy and copy your Render URL:
   - Example: `https://blockresume-api.onrender.com`

#### Step 2: Deploy frontend to Vercel

1. Import the same repo into Vercel.
2. In Vercel project env vars, add:
   - `NEXT_PUBLIC_COMPILE_API_URL=https://YOUR-RENDER-URL.onrender.com`
3. Deploy.

Now frontend runs on Vercel and calls Render for PDF compilation.

## Production Build

```bash
npm run build
npm run start
```

## Troubleshooting

- `Cannot connect to Docker daemon`:
  Start Docker Desktop, or use `USE_TECTONIC=1` / `USE_TEXLIVE=1`.
- CORS error when frontend calls Render API:
  Set `CORS_ORIGIN` on Render to your exact Vercel domain.
- Compile still failing:
  Open the "Show log snippet" panel in UI for LaTeX error context.

## Project Structure

- `template.tex`: Resume template (format source of truth)
- `src/lib/render.ts`: JSON -> LaTeX renderer
- `src/lib/schema.ts`: resume types + validation
- `src/app/api/compile/route.ts`: compile endpoint
- `src/app/page.tsx`: editor UI
- `render.yaml`: Render service configuration
- `Dockerfile`: container image for compile-capable deploy
