Status: ready-for-agent

# Follow-Up Prompts + Session Persistence

## Parent

`.scratch/buildmind-mvp/PRD.md`

## What to build

Enable iterative conversation with the agent. After the first prompt-response cycle, the user can send follow-up messages in the same workspace. Each follow-up is sent via WebSocket and processed by the agent with the full conversation history as context.

Session persistence: after each turn (user message + agent response cycle), the conversation is appended to `.buildmind/history.jsonl` in JSONL format. When the user re-opens the project, the conversation history is loaded from `history.jsonl` and displayed in the chat pane. The agent receives the full history when processing subsequent messages.

## Acceptance criteria

- [ ] User can send follow-up messages in an active workspace session
- [ ] Follow-up messages are processed through the agent loop with full conversation context
- [ ] After each turn, conversation is appended to `.buildmind/history.jsonl`
- [ ] Re-opening a project loads and displays the full conversation history in the chat pane
- [ ] Agent receives the full history for context-aware responses
- [ ] Tests verify session persistence round-trip (write → read → display)

## Blocked by

- `.scratch/buildmind-mvp/issues/03-workspace-agent-loop.md`
