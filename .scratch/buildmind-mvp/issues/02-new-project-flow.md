Status: ready-for-agent

# New Project Flow — Prompt → Create → Dashboard

## Parent

`.scratch/buildmind-mvp/PRD.md`

## What to build

The "New Project" text input at the bottom of the dashboard main area. When the user types a natural language prompt and presses Enter, the frontend sends a request to the backend, which creates a new project directory under the workspace (default: `~/BuildMindProjects/`) with a `.buildmind/` metadata directory containing `config.json` and an initial `history.jsonl`. The backend returns the project metadata, the project card appears in the dashboard grid, and the application navigates to the workspace page.

Project cards show the project name and a relative "last modified" timestamp. The project grid should handle an arbitrary number of projects.

## Acceptance criteria

- [ ] Prominent text input at the bottom of the dashboard main area with placeholder "Describe what you want to build..."
- [ ] Pressing Enter sends a POST request to create a new project
- [ ] Backend creates `~/BuildMindProjects/<project-name>/` with `.buildmind/config.json` and `.buildmind/history.jsonl`
- [ ] Backend returns project metadata (id, name, createdAt, updatedAt)
- [ ] New project card appears in the dashboard grid immediately
- [ ] Project card displays project name and relative timestamp
- [ ] Application navigates to the workspace page after creation
- [ ] Tests verify project creation API and dashboard interaction

## Blocked by

- `.scratch/buildmind-mvp/issues/01-foundation.md`
