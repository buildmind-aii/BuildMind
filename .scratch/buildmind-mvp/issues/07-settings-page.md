Status: ready-for-agent

# Settings Page + Provider API Key Management

## Parent

`.scratch/buildmind-mvp/PRD.md`

## What to build

The settings page accessible from the dashboard sidebar. It contains:

- **AI Providers section**: One input row per provider (OpenAI, Anthropic, Google, DeepSeek, OpenRouter, NVIDIA NIM). Each has a password-masked text input for the API key and a "show/hide" toggle. Keys are saved to a global config file (`.buildmind/config.json` in the workspace root).
- **Default Provider section**: A dropdown to select which provider to use by default.
- **Workspace section**: Shows the current workspace path.

The settings page has a back button to return to the dashboard. Changes are persisted immediately on save.

## Acceptance criteria

- [ ] Settings page is accessible from a link in the dashboard sidebar
- [ ] Settings page has a back button that returns to the dashboard
- [ ] One API key input per provider (password-masked, with show/hide toggle)
- [ ] Saving stores provider keys in `.buildmind/config.json`
- [ ] Default provider dropdown persists the selection
- [ ] Workspace path is displayed (read-only for MVP)
- [ ] Tests verify settings page renders and config persists correctly

## Blocked by

- `.scratch/buildmind-mvp/issues/01-foundation.md`
