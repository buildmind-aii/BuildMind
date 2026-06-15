# BuildMind

**No cloud. No lock-in. Just vibes.**

BuildMind is a local-first, open-source vibe coding platform that generates full-stack web applications from natural language prompts. Runs entirely on your machine.

---

## Features

- **AI-Powered Code Generation** — Describe what you want in plain English; BuildMind generates the full application
- **Local-First Architecture** — No cloud dependency, no vendor lock-in, no data leaving your machine
- **BYOK (Bring Your Own Key)** — Use your own API keys for OpenAI, Anthropic, Google Gemini, DeepSeek, OpenRouter, or NVIDIA NIM
- **Real-Time Streaming** — Watch the agent think, call tools, and build your app in real time via WebSocket
- **Live Preview** — See your generated app running instantly in the browser
- **Session Persistence** — Full conversation history saved as JSONL for easy resumption
- **Free Tier Support** — OpenRouter and NVIDIA NIM provide free model access to get started
- **Dark Mode UI** — Clean, developer-focused interface built with Shadcn UI v4 design tokens

---

## Quick Start

### Prerequisites

- Node.js >= 20
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/buildmind-aii/BuildMind.git
cd BuildMind

# Install dependencies
npm install

# Build all packages
npm run build
```

### Running BuildMind

```bash
# Start the server and open the browser
npm run start
```

BuildMind will start on a random available port and open your browser automatically.

### Development Mode

```bash
# Run frontend in dev mode with hot reload
npm run dev:web

# In a separate terminal, run the server
npm run start
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js + Fastify (TypeScript) |
| **Frontend** | React 19 + Vite (TypeScript) |
| **Design System** | Shadcn UI v4 (Neutral dark palette) |
| **Testing** | Vitest + React Testing Library |
| **Monorepo** | npm workspaces |
| **AI SDK** | Vercel AI SDK (provider-agnostic) |

---

## Project Structure

```
BuildMind/
├── apps/
│   └── web/                    # React 19 + Vite frontend
│       ├── src/
│       │   ├── components/     # UI components
│       │   ├── App.tsx         # Root component
│       │   └── main.tsx        # Entry point
│       ├── public/
│       └── vite.config.ts
├── packages/
│   └── server/                 # Fastify backend
│       ├── src/
│       │   ├── index.ts        # Server entry
│       │   └── start.ts        # CLI entry point
│       ├── tests/
│       └── dist/               # Compiled output
├── docs/
│   └── agents/                 # Agent documentation
├── DESIGN.md                   # Shadcn UI v4 design tokens
├── CONTEXT.md                  # Domain glossary
├── PRODUCT.md                  # Product specification
├── AGENTS.md                   # Agent guidelines
├── package.json                # Root workspace config
├── tsconfig.json               # Root TypeScript config
└── vitest.config.ts            # Test configuration
```

---

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run build` | Build all packages |
| `npm run start` | Start server + open browser |
| `npm run test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run typecheck` | Type-check all TypeScript |
| `npm run dev:web` | Run frontend dev server |

### Architecture

BuildMind uses a monorepo structure with two packages:

- **`apps/web`** — React 19 + Vite frontend with Shadcn UI v4 components
- **`packages/server`** — Fastify backend that serves static files and manages the agent loop

The backend starts on a random OS-assigned port, serves the React frontend as static files, and handles all agent operations via WebSocket.

### Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch
```

Tests cover:
- Server startup and port binding
- CLI entry point behavior
- Dashboard component rendering
- Design token validation

---

## LLM Providers

BuildMind supports multiple AI providers via Vercel AI SDK. Configure your API keys in the dashboard settings:

| Provider | Models | Free Tier |
|----------|--------|-----------|
| **OpenAI** | gpt-4o, gpt-4o-mini, o3 | No |
| **Anthropic** | claude-sonnet-4-6, claude-haiku-4-5 | No |
| **Google Gemini** | gemini-2.5-flash, gemini-2.5-pro | Yes |
| **DeepSeek** | deepseek-chat, deepseek-reasoner | No |
| **OpenRouter** | meta-llama/llama-3.1-8b-instruct, mistralai/mistral-7b-instruct | Yes |
| **NVIDIA NIM** | google/gemma-2-9b-it, meta/llama-3.1-8b-instruct | Yes |

API keys are stored locally in `.buildmind/config.json` — never sent to BuildMind servers.

---

## Contributing

BuildMind is open source and contributions are welcome. Please see [AGENTS.md](./AGENTS.md) for coding guidelines and agent workflows.

### Key Principles

- **Local-first** — No cloud dependencies
- **TypeScript strict mode** — Zero errors, no `any` types
- **Test-driven** — All tools tested in isolation before wiring
- **Clean architecture** — Separate concerns, pure functions where possible

---

## Roadmap

- [ ] AI agent with tool execution (bash, file ops, glob, grep)
- [ ] WebSocket streaming of agent thinking and tool calls
- [ ] Workspace page with chat pane + live preview
- [ ] Multi-provider support (OpenAI, Anthropic, Google, DeepSeek, OpenRouter, NVIDIA NIM)
- [ ] Session persistence and project management
- [ ] Error recovery and staged generation
- [ ] Background daemon mode

---

## License

MIT License — see [LICENSE](./LICENSE) for details.

---

<p align="center">
  <strong>BuildMind</strong> — Describe it. Build it. Own it.
</p>
