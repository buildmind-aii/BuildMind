# BuildMind — Product Specification

**Version**: 1.0 (MVP)
**Status**: Pre-development
**License**: MIT

---

## 1. Product Overview

### 1.1 What is BuildMind?

BuildMind is a **local-first, open-source vibe coding platform** that generates full-stack web applications from natural language prompts. It runs entirely on the user's machine — no cloud dependency, no vendor lock-in, no subscription required. Users describe what they want in plain language, and an AI agent plans, generates, runs, and iterates on the application in real time through a clean web dashboard.

### 1.2 Why BuildMind?

Existing AI-powered app builders fall into two categories, both unsatisfying:

- **SaaS platforms** (Bolt.new, Emergent, Lovable, v0) — powerful but proprietary. Your code lives on their servers, you pay per token/month, and you're locked into their model choices and pricing. No privacy, no offline use, no fork-and-own freedom.

- **Open-source alternatives** (bolt.diy, dyad, Micracode, Vibecoder, Devonz) — promising in theory but universally buggy in practice. Broken streaming, flaky WebContainers, unreliable agent loops, abandoned repos, and fragile error handling. They advertise "just describe and build" but fail the moment a real project hits a build error, missing import, or non-trivial npm dependency.

BuildMind occupies the gap: **open source, local-first, and actually reliable**. It differentiates on three axes:

1. **Reliability** — a structured multi-stage agent loop that auto-detects and fixes errors, rather than single-pass generation
2. **Model freedom** — bring-your-own-key for 6+ providers (including free-tier options) via the Vercel AI SDK
3. **Local-first simplicity** — one npm install, one command, no cloud, no account, no data leaving your machine

### 1.3 Target Audience

- **Vibe coders** — non-technical users who want to build apps without writing code. They never want to see a file tree, terminal, or code editor. They type an idea and expect a working app.
- **Solo founders** — building MVPs fast without paying for cloud subscriptions. They want their code to stay on their machine.
- **Hobbyists** — experimenting with app ideas. They want free-tier models (OpenRouter, NVIDIA NIM) to avoid upfront costs.
- **Developers evaluating OSS** — technical users who want to inspect, fork, and trust the code before adopting it.

---

## 2. Architecture

### 2.1 High-Level System Design

```
npm install -g buildmind
         │
    ┌────▼────┐
    │  CLI    │  buildmind  →  starts backend  →  opens browser
    └────┬────┘
         │
    ┌────▼────────────────┐
    │  Node.js Backend    │  (Express / Fastify)
    │                     │
    │  ┌───────────────┐  │
    │  │ Agent Engine  │  │  Vercel AI SDK + tool execution
    │  │ (maxSteps)    │  │
    │  └───────────────┘  │
    │  ┌───────────────┐  │
    │  │ WS Server     │  │  Persistent WebSocket for streaming
    │  └───────────────┘  │
    │  ┌───────────────┐  │
    │  │ Tool Runtime  │  │  bash, process, file ops, glob, grep
    │  └───────────────┘  │
    │  ┌───────────────┐  │
    │  │ Project Store │  │  File system read/write for projects
    │  └───────────────┘  │
    │  ┌───────────────┐  │
    │  │ Static Server │  │  Serves React frontend
    │  └───────────────┘  │
    └──────────┬──────────┘
               │
    ┌──────────▼──────────┐
    │  Browser            │
    │  ┌──────────────┐  │
    │  │ React App    │  │  Shadcn UI v4, dark mode
    │  │ (Vite)       │  │
    │  └──────────────┘  │
    └─────────────────────┘
```

### 2.2 Port and Server Lifecycle

- On `buildmind`, the CLI starts the Node.js backend on a **random available port** (OS-assigned, `--port 0` pattern)
- Prints `Open http://localhost:{PORT} to continue`
- Opens the browser automatically to that URL
- When the terminal process is terminated (Ctrl+C), the server shuts down
- Post-MVP: `buildmind daemon` for background persistence

### 2.3 Process Model

- **Single process** — backend and frontend static serving are in one Node.js process
- No Docker, no VMs, no WebContainers
- Generated apps run as child processes in a dedicated temp directory
- No sandboxing — the agent has full access to the project directory (trust-based model, same as Claude Code)

### 2.4 Provider Architecture

```
User configures API keys in dashboard settings
              │
         ┌────▼────┐
         │ Provider│  Router resolves which provider to use
         │ Router  │  based on user's selection
         └────┬────┘
              │
    ┌─────────┼──────────────┐
    │         │              │
    ▼         ▼              ▼
OpenAI   Anthropic      Google Gemini  (DeepSeek, OpenRouter, NVIDIA NIM)
```

All providers share a uniform interface via Vercel AI SDK:

```ts
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createDeepSeek } from '@ai-sdk/deepseek'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

// All called the same way:
const { text } = await generateText({
  model: provider(modelName),
  system: systemPrompt,
  messages: conversationHistory,
  tools: toolSet,
  maxSteps: 10
})
```

Keys stored in `.buildmind/config.json`:

```json
{
  "providers": {
    "openai": { "apiKey": "sk-..." },
    "anthropic": { "apiKey": "sk-ant-..." },
    "google": { "apiKey": "AIza..." },
    "deepseek": { "apiKey": "sk-..." },
    "openrouter": { "apiKey": "sk-or-..." },
    "nvidia": { "apiKey": "nvapi-..." }
  },
  "defaultProvider": "openrouter"
}
```

---

## 3. Agent Design

### 3.1 Agent Loop

The agent uses Vercel AI SDK's **`maxSteps`** — a built-in reactive tool-use loop:

```
1. User sends prompt via WebSocket
2. Agent receives prompt + conversation history + tool definitions
3. LLM decides: respond directly or call a tool
4. If tool call:
   a. Backend executes the tool (bash, write file, etc.)
   b. Tool result returned to LLM
   c. LLM decides next step (more tools or respond)
5. LLM continues until it produces a final response (maxSteps limit)
6. Final response streamed back to user via WebSocket
```

Each turn (tool call or response) is streamed to the client in real time. The user sees:

```
🤔 Agent is thinking...
📝 Writing src/App.tsx...
📝 Writing src/components/Header.tsx...
💻 Running npm install...
🔧 Build error: missing react-router-dom. Installing...
📝 Writing src/index.tsx...
✅ Build succeeded! Your app is ready at http://localhost:3001/preview
```

### 3.2 Tool Definitions

Each tool is defined as a Vercel AI SDK tool with a JSON Schema and an execute function.

#### 3.2.1 bash

```ts
{
  name: 'bash',
  description: 'Execute a shell command in the project directory',
  parameters: z.object({
    action: z.enum(['execute', 'restart']),
    command: z.string().optional()
  }),
  execute: async ({ action, command }) => { ... }
}
```

- `execute`: Runs a command in a persistent shell session. Working directory persists across commands. Environment variables do NOT persist. Default timeout: 2 minutes, max: 10 minutes.
- `restart`: Clears the shell session state (starting directory, env).

#### 3.2.2 process

```ts
{
  name: 'process',
  description: 'Manage long-running background processes (dev servers, watchers)',
  parameters: z.object({
    action: z.enum(['spawn', 'list', 'read', 'tail', 'interact', 'kill', 'signal']),
    process_id: z.string().optional(),
    command: z.string().optional(),
    input: z.string().optional(),
    lines: z.number().optional(),
    signal: z.enum(['SIGINT', 'SIGTERM', 'SIGKILL']).optional()
  }),
  execute: async ({ action, process_id, command, input, lines, signal }) => { ... }
}
```

- `spawn`: Start a process in the background, return a process_id
- `list`: List all tracked background processes with status and uptime
- `read`: Read full output buffer of a process
- `tail`: Read last N lines of output
- `interact`: Send stdin to a running process
- `kill`: Terminate a process
- `signal`: Send a specific POSIX signal

#### 3.2.3 read_file

```ts
{
  name: 'read_file',
  description: 'Read the contents of a file',
  parameters: z.object({
    action: z.literal('read'),
    file_path: z.string(),
    offset: z.number().optional(),
    limit: z.number().optional()
  }),
  execute: async ({ file_path, offset, limit }) => { ... }
}
```

- `file_path`: Absolute or relative path
- `offset`: Starting line number (1-indexed)
- `limit`: Maximum lines to read (default: all)

#### 3.2.4 write_file

```ts
{
  name: 'write_file',
  description: 'Create a new file or overwrite an existing one',
  parameters: z.object({
    action: z.literal('write'),
    file_path: z.string(),
    content: z.string()
  }),
  execute: async ({ file_path, content }) => { ... }
}
```

Creates parent directories if they don't exist. Overwrites silently.

#### 3.2.5 edit_file

```ts
{
  name: 'edit_file',
  description: 'Make targeted edits to an existing file',
  parameters: z.object({
    action: z.enum(['edit', 'apply_patch']),
    file_path: z.string(),
    old_string: z.string().optional(),
    new_string: z.string().optional(),
    replace_all: z.boolean().optional(),
    patch: z.string().optional()
  }),
  execute: async ({ action, file_path, old_string, new_string, replace_all, patch }) => { ... }
}
```

- `edit`: Find `old_string` and replace with `new_string`. If `replace_all` is true, replace all occurrences.
- `apply_patch`: Apply a unified diff patch string.

#### 3.2.6 list_files

```ts
{
  name: 'list_files',
  description: 'List files and directories in a directory',
  parameters: z.object({
    action: z.literal('list'),
    path: z.string()
  }),
  execute: async ({ path }) => { ... }
}
```

Returns an array of entries with name, type (file/directory), and size.

#### 3.2.7 glob

```ts
{
  name: 'glob',
  description: 'Find files by glob pattern',
  parameters: z.object({
    action: z.literal('search'),
    pattern: z.string()
  }),
  execute: async ({ pattern }) => { ... }
}
```

Patterns like `**/*.ts`, `src/**/*.css`, `*.json`. Returns matching file paths sorted by modification time.

#### 3.2.8 grep

```ts
{
  name: 'grep',
  description: 'Search file contents with regular expressions',
  parameters: z.object({
    action: z.literal('search'),
    pattern: z.string(),
    include: z.string().optional()
  }),
  execute: async ({ pattern, include }) => { ... }
}
```

- `pattern`: Regex pattern to search for
- `include`: Optional glob filter (e.g., `*.ts`)

### 3.3 Reliability Strategy

The agent loop is specifically designed to fix the bugs in existing OSS tools:

1. **Error recovery**: When `bash` returns a non-zero exit, the agent automatically analyzes the error and attempts a fix (installing missing deps, fixing imports, adjusting configs)
2. **Staged generation**: The agent generates files one at a time rather than all at once, so failures are isolated
3. **Context management**: Conversation history is preserved so the agent doesn't lose track of what was built
4. **Tool prioritization**: Agent is prompted to use dedicated tools (read/write/edit_file) over raw bash for file operations, reducing command injection bugs

---

## 4. UI & UX

### 4.1 Theme

- **Dark mode only** — no light mode for MVP
- All CSS variables sourced from DESIGN.md Neutral palette dark tokens:

```css
:root {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.371 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --surface: oklch(0.2 0 0);
  --surface-foreground: oklch(0.708 0 0);
  --radius: 0.625rem;
}
```

Typography, spacing, border-radius, and component styles all follow DESIGN.md's Shadcn UI v4 specification.

### 4.2 Dashboard Page

```
┌───────────────────────────────────────────────────────┐
│  ┌────────┐  BuildMind                                │
│  │ ➕ New  │                                          │
│  └────────┘                                          │
│ ┌──────┬────────────────────────────────────────────┐ │
│ │  📁  │  ┌─────────┐ ┌─────────┐ ┌─────────┐      │ │
│ │  prj1│  │ My App  │ │ E-com   │ │ Todo    │      │ │
│ │  prj2│  │ 2h ago  │ │ 1d ago  │ │ 3d ago  │      │ │
│ │  prj3│  │ ┌─────┐ │ ┌─────┐ │ ┌─────┐ │      │ │
│ │  prj4│  │ │ img │ │ │ img │ │ │ img │ │      │ │
│ │      │  │ └─────┘ │ └─────┘ │ └─────┘ │      │ │
│ │  ⚙️  │  │ [⋮]     │ [⋮]     │ [⋮]     │      │ │
│ │      │  └─────────┘ └─────────┘ └─────────┘      │ │
│ │      │                                            │ │
│ │      │  ┌────────────────────────────────────┐    │ │
│ │      │  │ Describe what you want to build... │    │ │
│ │      │  └────────────────────────────────────┘    │ │
│ └──────┴────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────┘
```

**Components**:
- **Sidebar**: Project list with icons, active project highlight, settings link at bottom
- **Project cards**: Auto-generated thumbnail (screenshot of preview), project name, relative time, three-dot menu (rename, delete)
- **New project prompt**: Large text input at bottom of main area. User types a prompt and presses Enter — creates project and opens workspace
- **Empty state**: If no projects exist, show welcome message with "Create your first project" prompt

### 4.3 Workspace Page

```
┌──────────────────────────────────────────────────────────┐
│  ◀ Back    My App                    [Preview] [Logs] 🌙 │
├──────────────────────┬───────────────────────────────────┤
│  Chat                │                                   │
│                      │          Preview Container         │
│  ┌────────────────┐  │                                   │
│  │ Build a landing │  │                                   │
│  │ page with hero  │  │      (live generated app)        │
│  │ section...      │  │                                   │
│  └────────────────┘  │                                   │
│                      │                                   │
│  ┌────────────────┐  │                                   │
│  │ 🤔 Analyzing   │  │                                   │
│  │ requirements...│  │                                   │
│  └────────────────┘  │                                   │
│                      │                                   │
│  ┌────────────────┐  │                                   │
│  │ 📝 Writing     │  │                                   │
│  │ src/App.tsx... │  │                                   │
│  └────────────────┘  │                                   │
│                      │                                   │
│  ┌────────────────┐  │                                   │
│  │ 💻 npm install │  │                                   │
│  │ ...done (2.3s) │  │                                   │
│  └────────────────┘  │                                   │
│                      │                                   │
│  ┌────────────────┐  │                                   │
│  │ ✅ Build       │  │                                   │
│  │ succeeded!     │  │                                   │
│  └────────────────┘  │                                   │
│                      │                                   │
│  ──────────────────  │                                   │
│  │ Make the hero...│ [→]                               │
│  └─────────────────┘                                   │
└──────────────────────┴───────────────────────────────────┘
```

**Components**:
- **Header**: Back button (to dashboard), project name, tabs (Preview, Logs), theme toggle (placeholder for future light mode)
- **Chat pane** (left): Scrollable conversation. Every message streams in real time — user prompts, agent thinking, tool calls (with icon), tool results, final responses. Input bar at bottom with text area and send button.
- **Preview pane** (right): When Preview tab is active, this is an iframe or proxy showing the live generated app. Full width, full height. When Logs tab is active, this shows raw agent output.
- **No status bar** — all state and activity is part of the chat conversation

### 4.4 Settings Page

```
┌──────────────────────────────────────────────┐
│  ◀ Back                          Settings    │
│                                              │
│  ┌─────────────────────────────────────┐    │
│  │ AI Providers                        │    │
│  │                                     │    │
│  │ OpenAI        [·················] 🔑 │    │
│  │ Anthropic     [·················] 🔑 │    │
│  │ Google Gemini [·················] 🔑 │    │
│  │ DeepSeek      [·················] 🔑 │    │
│  │ OpenRouter    [·················] 🔑 │    │
│  │ NVIDIA NIM    [·················] 🔑 │    │
│  │                                     │    │
│  │ Default Provider: [OpenRouter ▼]    │    │
│  └─────────────────────────────────────┘    │
│                                              │
│  ┌─────────────────────────────────────┐    │
│  │ Workspace                           │    │
│  │ Workspace Path: ~/BuildMindProjects │    │
│  └─────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

---

## 5. WebSocket Protocol

### 5.1 Connection

```
Client → Server: WebSocket connect to ws://localhost:{PORT}/ws
Server → Client: { type: 'connected', sessionId: '...' }
```

### 5.2 Message Types

```typescript
// Client → Server
type ClientMessage =
  | { type: 'user_message'; content: string }
  | { type: 'new_project'; name: string; prompt: string }
  | { type: 'cancel_generation' }

// Server → Client
type ServerMessage =
  | { type: 'connected'; sessionId: string }
  | { type: 'agent_thinking'; content: string }
  | { type: 'tool_call'; tool: string; args: Record<string, unknown> }
  | { type: 'tool_result'; tool: string; result: string }
  | { type: 'agent_response'; content: string }
  | { type: 'error'; message: string }
  | { type: 'done' }
  | { type: 'preview_updated'; url: string }
```

### 5.3 Stream Flow

```
Client: { type: 'user_message', content: 'Build a landing page...' }
Server: { type: 'agent_thinking', content: 'I need to plan the structure...' }
Server: { type: 'tool_call', tool: 'write_file', args: { file_path: 'src/App.tsx', ... } }
Server: { type: 'tool_result', tool: 'write_file', result: 'File written (234 bytes)' }
Server: { type: 'tool_call', tool: 'bash', args: { action: 'execute', command: 'npm install' } }
Server: { type: 'tool_result', tool: 'bash', result: 'added 1242 packages...' }
Server: { type: 'agent_response', content: 'Done! Your landing page is ready.' }
Server: { type: 'preview_updated', url: 'http://localhost:{PORT}/preview' }
Server: { type: 'done' }
```

---

## 6. Project Storage

### 6.1 Directory Structure

```
~/BuildMindProjects/
├── my-app/
│   ├── .buildmind/
│   │   ├── config.json       # Provider keys, project settings
│   │   └── history.jsonl     # Full conversation (JSONL format)
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   └── ... (generated source)
│
├── e-commerce/
│   ├── .buildmind/
│   │   ├── config.json
│   │   └── history.jsonl
│   └── ... (generated source)
│
└── todo-app/
    └── ...
```

### 6.2 history.jsonl Format

Each line is a JSON object representing one turn in the conversation:

```jsonl
{"role":"user","content":"Build a landing page with hero section","timestamp":"2026-06-15T12:00:00Z"}
{"role":"agent","type":"thinking","content":"I need to plan the file structure","timestamp":"2026-06-15T12:00:01Z"}
{"role":"agent","type":"tool_call","tool":"write_file","args":{"file_path":"src/App.tsx","content":"..."},"timestamp":"2026-06-15T12:00:02Z"}
{"role":"agent","type":"tool_result","tool":"write_file","result":"File written","timestamp":"2026-06-15T12:00:03Z"}
{"role":"agent","type":"response","content":"Done! Here's your landing page.","timestamp":"2026-06-15T12:00:10Z"}
```

### 6.3 Project Lifecycle

- **Create**: User types prompt → project folder created → .buildmind initialized → history.jsonl starts with the prompt
- **Open**: Load history from .buildmind/history.jsonl → restore conversation context → start preview server for generated code
- **Rename**: Update project metadata in config.json
- **Delete**: Remove project directory from disk (with confirmation)

---

## 7. CLI Design

### 7.1 MVP Command

```bash
buildmind
```

Behavior:
1. Start Node.js backend on random available port
2. Print `BuildMind started at http://localhost:{PORT}`
3. Open browser to that URL
4. Block terminal until Ctrl+C
5. On exit, kill child processes + server

### 7.2 Post-MVP Commands

```bash
buildmind serve        # Start server only (no browser)
buildmind console      # Open browser to running server
buildmind daemon       # Start in background
buildmind stop         # Stop daemon
buildmind status       # Check if running + port
buildmind update       # Self-update via npm
```

---

## 8. Provider Details

### 8.1 Configuration

```ts
interface ProviderConfig {
  id: string
  name: string
  package: string
  createFunction: string
  models: string[]
  requiresKey: boolean
  hasFreeTier: boolean
}

const PROVIDERS: ProviderConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    package: '@ai-sdk/openai',
    createFunction: 'createOpenAI',
    models: ['gpt-4o', 'gpt-4o-mini', 'o3'],
    requiresKey: true,
    hasFreeTier: false
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    package: '@ai-sdk/anthropic',
    createFunction: 'createAnthropic',
    models: ['claude-sonnet-4-6', 'claude-haiku-4-5'],
    requiresKey: true,
    hasFreeTier: false
  },
  {
    id: 'google',
    name: 'Google Gemini',
    package: '@ai-sdk/google',
    createFunction: 'createGoogleGenerativeAI',
    models: ['gemini-2.5-flash', 'gemini-2.5-pro'],
    requiresKey: true,
    hasFreeTier: true
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    package: '@ai-sdk/deepseek',
    createFunction: 'createDeepSeek',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    requiresKey: true,
    hasFreeTier: false
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    package: '@openrouter/ai-sdk-provider',
    createFunction: 'createOpenRouter',
    models: ['meta-llama/llama-3.1-8b-instruct', 'mistralai/mistral-7b-instruct', 'google/gemma-2-9b-it'],
    requiresKey: true,
    hasFreeTier: true
  },
  {
    id: 'nvidia',
    name: 'NVIDIA NIM',
    package: '@ai-sdk/openai-compatible',
    createFunction: 'createOpenAICompatible',
    models: ['google/gemma-2-9b-it', 'meta/llama-3.1-8b-instruct'],
    requiresKey: true,
    hasFreeTier: true
  }
]
```

### 8.2 Model Selection

User picks a provider and model in the dashboard. Default: OpenRouter (free tier). Users can override per-session or change the default in settings.

---

## 9. Testing Strategy

### 9.1 Test Seams

| Seam | Type | What it validates |
|------|------|-------------------|
| Tool unit tests | Unit | Each tool handles valid input, invalid input, edge cases, and errors correctly |
| Mock agent loop | Integration | With a mock LLM returning fixed responses, verify tools are called in expected order and results propagate |
| Provider HTTP mock | Integration | Mock provider API responds with streaming chunks; verify Vercel AI SDK integration works |
| WebSocket integration | Integration | Connect with a WS client, send a message, verify expected sequence of server messages |
| Project filesystem | Integration | Create, rename, delete projects; verify .buildmind directory structure and history.jsonl |
| Dashboard component | Component (RTL) | Project grid renders, new project flow submits, settings page saves |

### 9.2 Testing Philosophy

- Test **external behavior**, not implementation details
- Prefer **integration tests** over unit tests where the integration provides more confidence
- Tool tests should be **deterministic** — mock file system and process execution
- Agent loop tests should use a **mock LLM** that returns predefined tool call sequences
- No real API keys in tests — all provider interactions are mocked

---

## 10. Out of Scope (MVP)

The following features are explicitly deferred to post-MVP:

- Code editor / file tree view in workspace
- Multi-user, team collaboration, or sharing
- Cloud hosting deployment
- Desktop app (Electron/Tauri)
- Plugin system or MCP server integration
- LSP / code intelligence tools
- Web search or web fetch agent tools
- Sub-agents or parallel agent orchestration
- Daemon mode or background server persistence
- Light mode theme
- Mobile responsive design
- CI/CD integration
- Authentication or user accounts
- Database management UI
- Auto-generated project thumbnails (placeholder cards for MVP)

---

## 11. Development Phases

### Phase 1: Foundation
- Scaffold frontend (React + Vite + Shadcn UI v4)
- Scaffold backend (Node.js + Express/Fastify)
- Implement CLI entry point (`buildmind`)
- Implement dashboard page (project grid + new project input)

### Phase 2: Agent Engine
- Implement all 8 tools (bash, process, read/write/edit_file, list_files, glob, grep)
- Integrate Vercel AI SDK with OpenAI provider
- Implement WebSocket streaming protocol
- Wire tool calls through the agent loop

### Phase 3: Workspace & Preview
- Implement workspace page (chat pane + preview pane + tabs)
- Implement preview server for generated apps
- Wire preview pane to show running app
- Add Logs tab for raw agent output

### Phase 4: Providers & Settings
- Implement settings page with provider key management
- Integrate Anthropic, Google, DeepSeek, OpenRouter, NVIDIA NIM
- Add model selection per project

### Phase 5: Reliability & Polish
- Error recovery in agent loop
- Session persistence (history.jsonl)
- Project rename/delete
- Streaming UX polish (icons, animations, typing indicators)

### Phase 6: Testing
- Tool unit tests
- Mock agent loop integration tests
- WebSocket integration tests
- Dashboard component tests
- Project lifecycle tests

---

## 12. Design Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Build approach | From scratch | Full control over architecture; no inherited bugs from OSS forks |
| Backend language | TypeScript/Node.js | Same language as frontend; Vercel AI SDK is JS-native |
| AI SDK | Vercel AI SDK v6 | Provider-agnostic, thin abstraction, streaming + tool use built-in |
| Runtime | Local process, no sandbox | Simplicity; trust-based model like Claude Code |
| UI framework | React + Shadcn UI v4 | DESIGN.md already specifies complete Shadcn v4 design tokens |
| Theme | Dark mode only | MVP scope; DESIGN.md Neutral palette dark tokens |
| Interface | Web UI dashboard | Differentiates from CLI-only agents; target is non-technical users |
| Projects | Multi-project dashboard | User wants to manage multiple ideas |
| Agent loop | Reactive maxSteps (tool use) | Vercel AI SDK built-in; structured but flexible |
| Port assignment | OS random | Zero port conflicts |
| Preview | Full container, no split | Vibe coders don't need to see code alongside preview |
| Streaming | Persistent WebSocket | Real-time bidirectional communication |
| Session storage | .buildmind/history.jsonl | Simple, portable, git-ignorable |
| Provider auth | BYOK | Zero operational cost; user controls their keys and data |
| Free tier | OpenRouter + NVIDIA NIM | Lowers adoption friction |
| Only MVP command | `buildmind` | Single entry point reduces confusion |

---

## 13. Competitive Landscape

| Tool | Open Source | Local-First | Model Freedom | Reliability |
|------|:-----------:|:-----------:|:-------------:|:-----------:|
| **Bolt.new** | Partial | ❌ | ❌ | ✅ |
| **Emergent** | ❌ | ❌ | ❌ | ✅ |
| **Lovable** | ❌ | ❌ | ❌ | ✅ |
| **bolt.diy** | ✅ | ✅ | ✅ | ❌ |
| **dyad** | ✅ | ✅ | ✅ | ❌ |
| **Micracode** | ✅ | ✅ | ✅ | ❌ |
| **VibeCoder** | ✅ | ✅ | ✅ | ❌ |
| **Devonz** | ✅ | ✅ | ✅ | ❌ |
| **BuildMind** | ✅ | ✅ | ✅ | ✅ (goal) |

BuildMind's only competitor on reliability + open source + local-first + model freedom is... no one. That's the gap.

---

## 14. Glossary

| Term | Definition |
|------|-----------|
| **Vibe coding** | Building software by describing what you want in natural language, with AI generating the code |
| **Agent loop** | The cycle of LLM thinking → tool calling → tool result → LLM deciding next step |
| **Tool** | A capability the agent can invoke (bash, read file, write file, etc.) |
| **Provider** | An LLM API service (OpenAI, Anthropic, Google, etc.) |
| **BYOK** | Bring Your Own Key — user supplies their own API keys |
| **Workspace** | The directory where all BuildMind projects are stored |
| **Project** | A single generated application with its conversation history |
| **Session** | A saved conversation with an agent, persisted as JSONL |
| **maxSteps** | Vercel AI SDK's built-in agent loop that auto-continues on tool calls |
| **WebSocket** | Persistent bidirectional TCP connection for real-time streaming |
| **Preview** | The live running instance of the generated application |
| **Shadcn UI v4** | The design system specified in DESIGN.md that defines all visual tokens |
