Status: ready-for-agent

# PRD: BuildMind MVP — Local Open-Source Vibe Coding Platform

## Problem Statement

Existing AI-powered app builders are either SaaS with vendor lock-in (Bolt.new, Emergent) or unreliable open-source alternatives (bolt.diy, dyad) that are buggy, broken, and don't work in practice. Developers and vibe coders need a local, open-source, model-agnostic platform that reliably generates, runs, and iterates on full-stack web applications from natural language prompts — without cloud dependency, without code editor complexity, and without the bugs that plague current OSS solutions.

## Solution

BuildMind is a local-first, open-source vibe coding platform that runs entirely on the user's machine. Users describe what they want in natural language, and BuildMind's AI agent generates, previews, and iterates on full-stack web applications in real time — all through a clean web dashboard with a chat interface and live app preview. No API keys to manage for free-tier users (OpenRouter/NVIDIA NIM), no code to write, no cloud to configure.

## User Stories

1. As a vibe coder, I want to install BuildMind with a single npm command, so that I can start building immediately without complex setup.
2. As a user, I want to run `buildmind` in my terminal and have a dashboard open in my browser automatically, so that I don't need to navigate or configure anything.
3. As a user, I want to see a project dashboard when I first open BuildMind, so that I can manage all my projects in one place.
4. As a user, I want to create a new project by typing a prompt in the dashboard, so that I can start building from an idea.
5. As a user, I want to see project cards with names and last-modified dates, so that I can quickly identify and resume my work.
6. As a user, I want to delete and rename projects from the dashboard, so that I can keep my workspace organized.
7. As a user, I want to configure my API keys (OpenAI, Anthropic, Google, DeepSeek, OpenRouter, NVIDIA NIM) in settings, so that BuildMind can use my preferred model providers.
8. As a user with no API key, I want to use free-tier models via OpenRouter or NVIDIA NIM, so that I can try BuildMind without paying.
9. As a user, I want to open a project and see a chat interface on the left and a live app preview on the right, so that I can talk to the agent and see results simultaneously.
10. As a user, I want my prompt to be sent to the agent and see the response stream in real time in the chat, so that I can watch the agent think and work.
11. As a user, I want to see the agent's tool calls (file writes, bash commands, code searches) streamed live in the chat, so that I understand what the agent is doing.
12. As a user, I want the generated app to appear in the preview pane on the right, so that I can interact with it immediately.
13. As a user, I want to send follow-up prompts to refine the generated app, so that I can iterate toward my vision.
14. As a user, I want the agent to automatically fix build errors by reading error output and making corrections, so that I don't have to debug manualy.
15. As a user, I want to switch between the Preview tab and Logs tab in the workspace header, so that I can see either my generated app or the agent's raw output.
16. As a user, I want my conversation history and project files to persist between sessions, so that I can close BuildMind and resume later.
17. As a user, I want the agent to work on my project until the task is complete, using tools like file read/write, bash commands, and code search as needed.
18. As a user, I want to provide API keys through a settings panel in the dashboard, so that I can use multiple providers without editing config files.
19. As a user, I want all interactions to be dark mode styled using the Shadcn UI v4 design system, so that the interface is visually consistent and comfortable.
20. As a developer evaluating BuildMind, I want it to be open source under an MIT license, so that I can inspect, modify, and trust the code.

## Implementation Decisions

### Architecture
- **Frontend**: React 19 + Shadcn UI v4 (Neutral palette, dark mode only). Tokens defined in `DESIGN.md`.
- **Backend**: Node.js with Express or Fastify. Backend handles all tool execution, LLM routing, file system operations, and WebSocket connections.
- **AI SDK**: Vercel AI SDK v6 for provider-agnostic LLM calls with streaming and tool use.
- **CLI**: Single `buildmind` npm command. Starts backend on a random OS-assigned port, opens browser to dashboard.
- **Theme**: Dark mode only. All CSS variables sourced from DESIGN.md Neutral palette dark tokens.

### Agent
- Loop: Reactive multi-stage agent loop using Vercel AI SDK's `maxSteps` (tool use with automatic continuation).
- Tools:
  - `bash` (execute shell command, restart shell)
  - `process` (spawn, list, read, tail, interact, kill, signal — for long-running processes)
  - `read_file` (read file with optional line range)
  - `write_file` (create or overwrite file)
  - `edit_file` (exact string replacement, apply patch)
  - `list_files` (list directory contents)
  - `glob` (find files by pattern)
  - `grep` (search file contents by regex)
- Transport: Persistent WebSocket for bidirectional streaming of prompts, tool calls, and results.

### LLM Providers
All providers integrated via Vercel AI SDK:
- OpenAI (`@ai-sdk/openai`)
- Anthropic (`@ai-sdk/anthropic`)
- Google Gemini (`@ai-sdk/google`)
- DeepSeek (`@ai-sdk/deepseek`)
- OpenRouter (`@openrouter/ai-sdk-provider`)
- NVIDIA NIM (`@ai-sdk/openai-compatible`)
- BYOK: keys stored in `.buildmind/config.json` per project.

### Project Storage
- Projects live in a user-defined workspace directory.
- Per-project subdirectory with:
  - `.buildmind/history.jsonl` — full conversation history (prompts, tool calls, results)
  - `.buildmind/config.json` — provider keys and project settings
  - Generated source code files from the agent
- Session persistence: conversation history stored and restored on project open.

### UI Pages
1. **Dashboard**:
   - Left sidebar: project list + settings link
   - Main area: project cards (name, last modified, delete/rename menu) + prominent new project prompt input
2. **Workspace** (per project):
   - Header: project name + tabs (Preview, Logs)
   - Left pane: chat interface with streaming agent output (thinking, tool calls, results)
   - Right pane: full-width container showing either live app preview (Preview tab) or raw agent log output (Logs tab)
   - No status bar; all agent activity streams into the chat

### Testing Seams
- **Tool execution**: Unit tests per tool function (valid/invalid inputs, edge cases)
- **Agent loop**: Integration test with mock LLM (fixed responses) to verify tool call routing
- **Project lifecycle**: Integration tests for create, rename, delete, session persistence
- **Provider routing**: Integration test with mock HTTP server for provider API
- **WebSocket streaming**: Integration test with WS client for message streaming and reconnection
- **Dashboard UI**: Component tests with React Testing Library for project grid, new project flow

All seams are new (greenfield project). Test at the highest possible level — prefer integration over unit where practical.

## Out of Scope

- Code editor / file tree view in workspace (Post-MVP)
- Multi-user or team collaboration
- Cloud hosting or deployment
- Desktop app (Electron/Tauri)
- Plugin/MCP system
- LSP or code intelligence tools
- Web search or web fetch tools
- Sub-agents or parallel agent orchestration
- Daemon mode or background persistence
- Light mode theming
- Mobile responsiveness

## Further Notes

- The DESIGN.md at the repo root contains the complete Shadcn UI v4 design token specification and must be the source of truth for all styling decisions.
- All CLI commands beyond `buildmind` (serve, console, daemon, stop, status, update) are deferred to post-MVP.
- The agent's reliability is the highest priority — a multi-stage reactive loop with auto-fix behavior is the primary differentiator from existing buggy OSS tools.
- Free-tier model access (OpenRouter free models, NVIDIA NIM 1000 credits) is critical for reducing adoption friction.
