Status: ready-for-agent

# Error Recovery — Auto-Fix Build Errors

## Parent

`.scratch/buildmind-mvp/PRD.md`

## What to build

When the agent runs a bash command that returns a non-zero exit code (e.g., build fails, missing dependency, import error), the agent should automatically analyze the error output and attempt a fix. This is implemented through system prompt instructions and the reactive agent loop (maxSteps) — when the LLM sees a tool result with an error, it should analyze the output and call the appropriate tool (bash to install deps, write_file to fix imports, etc.) to resolve the issue.

The system prompt should include guidance on:
- Reading error output to identify the root cause
- Installing missing npm packages
- Fixing broken import paths
- Retrying failed commands after fixes
- Knowing when to stop (after N retries, surface the error to the user)

## Acceptance criteria

- [ ] Agent detects non-zero exit codes from bash tool results
- [ ] Agent analyzes error output and identifies the root cause
- [ ] Agent calls appropriate tools to fix common errors (missing deps, broken imports, config issues)
- [ ] Agent retries the failed command after applying a fix
- [ ] Agent surfaces unrecoverable errors to the user after N retries
- [ ] Tests verify error recovery scenarios with mock tool results

## Blocked by

- `.scratch/buildmind-mvp/issues/03-workspace-agent-loop.md`
