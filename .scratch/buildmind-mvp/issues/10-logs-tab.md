Status: ready-for-agent

# Logs Tab — Raw Agent Output

## Parent

`.scratch/buildmind-mvp/PRD.md`

## What to build

Add a Logs tab to the workspace header alongside the Preview tab. When the Logs tab is active, the right pane switches from the live preview to a scrollable view showing raw agent output — every tool call with its full arguments and results, bash command outputs, file writes, and errors. This is useful for debugging and for technical users who want to see exactly what the agent is doing.

The tab switch updates the URL hash or query parameter so the active tab is preserved on navigation. The logs view auto-scrolls to the bottom as new entries arrive via WebSocket.

## Acceptance criteria

- [ ] Logs tab appears in the workspace header alongside Preview tab
- [ ] Clicking Logs tab switches the right pane to show raw agent output
- [ ] Clicking Preview tab switches back to the live preview
- [ ] Logs show tool calls with full arguments, tool results, and errors
- [ ] Logs auto-scroll to the bottom as new entries arrive
- [ ] Active tab is preserved in URL (hash or query param)
- [ ] Tests verify tab switching and log rendering

## Blocked by

- `.scratch/buildmind-mvp/issues/03-workspace-agent-loop.md`
