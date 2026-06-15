Status: ready-for-agent

# Project Management — Rename and Delete

## Parent

`.scratch/buildmind-mvp/PRD.md`

## What to build

Project card actions: each project card in the dashboard grid has a three-dot menu (⋮) with "Rename" and "Delete" options.

- **Rename**: Opens an inline dialog to edit the project name. On save, sends a PATCH request to update the project metadata in `.buildmind/config.json` and the project directory name on disk. The card updates with the new name.
- **Delete**: Opens a confirmation dialog ("Are you sure you want to delete <project name>?"). On confirm, sends a DELETE request. The backend removes the entire project directory from disk. The card is removed from the grid with an animation.

## Acceptance criteria

- [ ] Each project card has a three-dot menu with Rename and Delete options
- [ ] Rename opens an editable input; saving updates project name on disk and in the grid
- [ ] Delete shows a confirmation dialog before removing the project
- [ ] Confirming delete removes the project directory from disk
- [ ] Cancelling delete dismisses the dialog with no action
- [ ] Tests verify rename/delete API endpoints and UI flow

## Blocked by

- `.scratch/buildmind-mvp/issues/02-new-project-flow.md`
