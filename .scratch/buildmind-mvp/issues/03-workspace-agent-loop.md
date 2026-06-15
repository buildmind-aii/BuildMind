Status: ready-for-agent

# Workspace Shell + WebSocket + Agent Loop (OpenAI, bash, write_file)

## Parent

`.scratch/buildmind-mvp/PRD.md`

## What to build

The workspace page and the core agent loop. The workspace page has a header showing the project name with Preview/Logs tab switches, a chat pane on the left, and an empty preview pane placeholder on the right.

When the workspace opens, a WebSocket connection is established to the backend. The user types a prompt in the chat input, which is sent via WebSocket to the backend. The backend invokes the Vercel AI SDK agent loop with OpenAI (the only provider for this slice) and two tools: `bash` (execute shell commands) and `write_file` (create/overwrite files). Tool calls, results, and agent responses stream back to the chat UI in real time, displaying appropriate icons for thinking, tool calls, and results.

The chat pane is scrollable, shows the full conversation, and has an input bar at the bottom with a send button.

## Acceptance criteria

- [ ] Workspace page renders: header (project name + Preview/Logs tabs), chat pane (left), preview pane placeholder (right)
- [ ] WebSocket connects to `ws://localhost:{PORT}/ws` on workspace open
- [ ] User sends message via chat input → sent over WebSocket as `{ type: 'user_message', content: '...' }`
- [ ] Backend runs agent loop using Vercel AI SDK `maxSteps` with OpenAI provider
- [ ] `bash` tool executes shell commands in the project directory
- [ ] `write_file` tool creates or overwrites files with automatic parent directory creation
- [ ] Agent thinking, tool calls (`tool_call`), tool results (`tool_result`), and final responses stream to chat in real time
- [ ] Chat UI shows distinct visual treatments for thinking, tool calls, and tool results
- [ ] Tests verify WebSocket message flow and agent loop with mock LLM

## Blocked by

- `.scratch/buildmind-mvp/issues/02-new-project-flow.md`
