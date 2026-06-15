## Agent skills

### Issue tracker

Issues are tracked as local markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Uses the default label vocabulary (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — one CONTEXT.md + docs/adr/ at the repo root. See `docs/agents/domain.md`.

## Coding guidelines

### Design tokens & styling

- **No inline styles ever.** Use CSS classes and variables only. All design tokens come from `DESIGN.md` (colors, typography, spacing, border-radius, shadows).
- Generate Tailwind CSS config and CSS custom properties programmatically from `DESIGN.md`. Never hardcode a color, font size, or spacing value in component code.
- If a visual pattern repeats (button, card, badge), it must be a reusable component — no copy-paste of the same HTML+classes.
- Prefer Tailwind utility classes for one-off layouts and component classes for reusable patterns. Keep the token-to-class mapping centralized.

### Modularity & separation of concerns

- **One file, one responsibility.** A file that reads a file AND parses output AND sends a WebSocket message is doing too much. Split into: fileReader, outputParser, wsSender.
- Each function should do exactly one thing and have a name that says what it does. If you see `processDataAndSendResponse()`, split it.
- Prefer pure functions where possible — same input always produces same output. Side effects (file I/O, network, process spawn) should be isolated and explicit.
- Tool implementations (`bash`, `read_file`, etc.) should have zero knowledge of WebSocket or HTTP. They take input, produce output, and return errors. Transport layer is separate.

### Code quality

- **Don't write 10 lines when 2 lines do the job.** Fewer lines = fewer places to hide bugs. But don't golf — clarity over brevity.
- If the same logic appears twice, extract it. Third time, it's already overdue.
- Error handling is not optional. Every tool execution, every file operation, every process spawn must handle failure explicitly. No silent `catch { }`.
- Use strict TypeScript. No `any`. No `as` casts unless the type system genuinely can't express it (and even then, prefer Zod at the boundary).
- Add timeouts to everything that touches the network or filesystem. The Vercel AI SDK supports per-tool timeouts — use them.

### Decision-making

- **Don't trust hypotheses, trust sources.** If you're unsure about a library API, a framework behavior, or a best practice — search the web, read the docs, confirm before writing code.
- If search contradicts your assumption, trust the search. If two sources contradict, find a third.
- When designing an interface or data flow, look at how established tools (Claude Code, OpenCode, Vercel AI SDK examples) solve the same problem. Learn from their patterns before inventing your own.
- If something feels hacky or fragile, it probably is. Step back, research the right approach, and refactor.

### Agent reliability

- Test every tool in isolation before wiring it to the LLM. A flaky tool means a flaky agent.
- Model the agent loop as explicit states (thinking, tool_calling, waiting, responding), not a streaming blob. Each state recovers independently.
- All file I/O from the agent must go through dedicated tools (write_file, edit_file), not through `bash echo > file`. This gives a single choke point for validation and logging.
- Separate transport (WebSocket) from agent logic. The agent should be a pure function that anyone can call — not coupled to a network protocol.

### Testing

- Prefer integration tests over unit tests where the integration gives more confidence.
- Test with a mock LLM that returns predetermined tool call sequences — no real API calls in tests.
- Tool tests must be deterministic. Mock the filesystem and process execution.
- Test error paths, not just happy paths. What happens when npm install fails? When a file is locked? When the LLM returns malformed JSON?
