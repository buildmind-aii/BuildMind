Status: ready-for-agent

# Foundation — CLI + Dashboard Shell

## Parent

`.scratch/buildmind-mvp/PRD.md`

## What to build

The entry point and landing page. Running `buildmind` in the terminal starts a Node.js backend (Express or Fastify) on a random OS-assigned port, prints the URL, and opens the browser automatically to the dashboard. The React frontend (Vite + React 19 + Shadcn UI v4) is served as static files from the backend.

The dashboard page renders with a left sidebar (project list skeleton — empty for now) and a main area with a welcome/empty state message prompting the user to create their first project. All styling uses the Shadcn UI v4 Neutral palette dark tokens from DESIGN.md — no inline styles, no hardcoded values.

## Acceptance criteria

- [ ] Running `buildmind` starts the backend on a random available port
- [ ] URL is printed to terminal: `BuildMind started at http://localhost:{PORT}`
- [ ] Browser opens automatically to that URL
- [ ] React frontend loads and shows the dashboard page
- [ ] Dashboard shows sidebar (empty project list) and main area with empty state welcome message
- [ ] All styling uses Shadcn UI v4 dark tokens from DESIGN.md
- [ ] Ctrl+C shuts down the server cleanly
- [ ] Tests verify CLI starts server and serves the React app

## Blocked by

None — can start immediately
