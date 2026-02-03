# BlockResume

BlockResume is a block-based resume builder. Users edit structured blocks (sections, groups, entries, bullets) and the backend renders safe LaTeX using the Jake Gutierrez template, then compiles to PDF.

## Requirements

- Node.js 18+
- Docker (recommended) or local `tectonic`

## Setup

```bash
npm install
```

Create an optional `.env.local` (see `.env.example`).

## Development

```bash
npm run dev
```

Open `http://localhost:3000`.

## Production

```bash
npm run build
npm run start
```

## PDF Compilation

The API endpoint `POST /api/compile` renders LaTeX using `template.tex` and compiles it to `resume.pdf`.

Default behavior uses Docker for sandboxing:

- Runs a Tectonic-based container with no network
- CPU, memory, and process limits
- No shell-escape

Set `LATEX_DOCKER_IMAGE` if you want to use a specific compiler image (default is a public TeX Live image on Docker Hub). If you are on Apple Silicon and the image has no arm64 manifest, set `LATEX_DOCKER_PLATFORM=linux/amd64` to run via emulation. If Docker is unavailable, set `USE_TECTONIC=1` to compile with a locally installed `tectonic` binary (still no shell-escape).

## Free Deployment (Render)

Render can deploy this app for free using the provided `Dockerfile` and `render.yaml`.

Steps:

1. Push this repo to GitHub.
2. Go to Render and create a new **Web Service** from the repo.
3. Render will detect `render.yaml` and use Docker automatically.
4. Once deployed, open the service URL.

Notes:

- The Docker image includes TeX Live, and the app compiles using `USE_TECTONIC=1`.
- Free tier services can sleep when idle.

## Notes

- All user-provided strings are escaped to prevent LaTeX injection.
- Resume data is stored in `localStorage`.
- You can export/import JSON from the UI.

## Files

- `template.tex`: base LaTeX template (macros preserved)
- `src/lib/schema.ts`: data model and runtime validation
- `src/lib/render.ts`: LaTeX rendering + escaping
- `src/app/api/compile/route.ts`: PDF compilation endpoint
- `src/app/page.tsx`: editor + preview UI
