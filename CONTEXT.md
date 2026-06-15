# BuildMind — Domain Glossary

## Product

**BuildMind** — A local-first, open-source vibe coding platform that generates full-stack web applications from natural language prompts. Runs entirely on the user's machine.

**Vibe coding** — Building software by describing what you want in natural language, with AI generating the code.

**Vibe coder** — The target user. Non-technical users who want to build apps without writing code. They never want to see a file tree, terminal, or code editor.

## Architecture

**Agent** — The AI-powered coding assistant that drives BuildMind. Receives prompts, plans, calls tools, generates code, and iterates until the task is complete.

**Agent loop** — The cycle of LLM thinking → tool calling → tool result → LLM deciding next step. BuildMind uses Vercel AI SDK's reactive maxSteps loop rather than a fixed pipeline.

**maxSteps** — Vercel AI SDK's built-in agent loop that auto-continues on tool calls. The LLM can call multiple tools in sequence until it produces a final response.

**Tool** — A capability the agent can invoke. BuildMind's tools: bash, process, read_file, write_file, edit_file, list_files, glob, grep.

**Tool runtime** — The backend execution engine that runs tool implementations. Pure functions — take input, produce output, return errors. No knowledge of WebSocket or HTTP.

## Infrastructure

**CLI** — The command-line entry point (`buildmind`). Starts the Node.js backend on a random port and opens the browser.

**Provider** — An LLM API service (OpenAI, Anthropic, Google Gemini, DeepSeek, OpenRouter, NVIDIA NIM).

**BYOK** — Bring Your Own Key. Users supply their own API keys, stored in `.buildmind/config.json`. No cloud billing from BuildMind.

**OpenRouter** — Unified API gateway providing access to hundreds of models. Included for free-tier model access.

**NVIDIA NIM** — NVIDIA's inference microservice with OpenAI-compatible API. Included for free-tier model access (1000 free credits).

## Data Model

**Workspace** — The parent directory where all BuildMind projects live (default: `~/BuildMindProjects/`).

**Project** — A single generated application with its conversation history. A subdirectory within the workspace containing generated source code + `.buildmind/` metadata.

**Session** — A saved conversation with an agent, persisted as `.buildmind/history.jsonl` (JSONL format, one JSON object per turn).

**Preview** — The live running instance of the generated application. Displayed in the right pane of the workspace, full container width and height.

**WebSocket** — Persistent bidirectional TCP connection used for real-time streaming of agent thinking, tool calls, and results between the Node.js backend and the browser frontend.

## Design

**Shadcn UI v4** — The design system specified in `DESIGN.md`. Defines all visual tokens: colors (OKLCH), typography (Geist, Space Grotesk, Playfair Display, Inter, JetBrains Mono), spacing (8px base unit), border-radius, shadows, and component anatomy for 8 visual styles.

**DESIGN.md** — Source-of-truth file at the repo root containing all Shadcn UI v4 design tokens. CSS variables and Tailwind config must be generated from this file programmatically — never hardcoded.

## Roles

**Dashboard** — The main landing page showing a project grid, new project input, and sidebar with project list and settings.

**Workspace page** — The per-project building interface. Split into chat pane (left) and preview pane (right) with tabs (Preview, Logs) in the header.

## Agent guidelines

All file I/O from the agent must go through dedicated tools (write_file, edit_file), never through `bash echo > file`. The bash tool is for running commands, not for file operations.

The agent loop is a state machine: thinking → tool_calling → waiting_for_result → responding. Each state recovers independently.

No inline styles. All styling comes from DESIGN.md tokens via CSS classes and Tailwind utility classes.
