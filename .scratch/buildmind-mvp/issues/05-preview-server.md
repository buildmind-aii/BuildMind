Status: ready-for-agent

# Preview Server — Run Generated App in Preview Pane

## Parent

`.scratch/buildmind-mvp/PRD.md`

## What to build

The preview pane shows the live generated app. When the agent finishes generating code and installs dependencies, the backend spawns a dev server for the generated app (using the `process` tool). The preview pane displays the running app via an iframe or reverse proxy. When the Preview tab is active, the right pane shows the live app at full width and height. When files change, the preview auto-refreshes.

The backend sends a `preview_updated` WebSocket message when the preview URL changes, so the frontend can update the iframe src accordingly.

## Acceptance criteria

- [ ] Generated app's dev server starts as a child process when the agent runs `npm install` + `npm run dev`
- [ ] Preview pane displays the running app via iframe at full width and height
- [ ] Preview auto-refreshes when files change (dev server HMR or manual refresh)
- [ ] Backend sends `{ type: 'preview_updated', url: '...' }` via WebSocket when preview is ready
- [ ] Frontend updates iframe src on `preview_updated` message
- [ ] Tests verify preview lifecycle (spawn, serve, terminate on project close)

## Blocked by

- `.scratch/buildmind-mvp/issues/04-remaining-tools.md`
