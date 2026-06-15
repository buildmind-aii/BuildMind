Status: ready-for-agent

# Remaining Agent Tools (read_file, edit_file, process, list_files, glob, grep)

## Parent

`.scratch/buildmind-mvp/PRD.md`

## What to build

Implement and wire the remaining 6 agent tools into the tool set used by the Vercel AI SDK agent loop:

- **read_file**: Read file contents with optional line offset/limit
- **edit_file**: Targeted string replacement (`edit` action) and unified diff patching (`apply_patch` action)
- **process**: Manage long-running background processes — spawn, list, read full output, tail last N lines, send stdin, kill, send POSIX signals
- **list_files**: List directory contents (entries with name, type, size)
- **glob**: Find files by glob pattern, sorted by modification time
- **grep**: Search file contents with regex, with optional file type filter

All tools must handle errors explicitly (invalid paths, missing files, timeouts) and return structured results.

## Acceptance criteria

- [ ] `read_file` reads files with optional offset/limit parameters
- [ ] `edit_file` supports exact string replacement (`edit`) and unified diff (`apply_patch`)
- [ ] `process` manages background processes: spawn, list, read, tail, interact, kill, signal
- [ ] `list_files` returns directory entries with name, type, and size
- [ ] `glob` finds files by glob pattern, sorted by modification time
- [ ] `grep` searches file contents with regex and optional file type filter
- [ ] All tools handle errors (invalid paths, missing files, timeouts) explicitly
- [ ] All tools are wired into the Vercel AI SDK tool set for the agent
- [ ] Unit tests exist for each tool covering valid input, invalid input, and edge cases

## Blocked by

- `.scratch/buildmind-mvp/issues/03-workspace-agent-loop.md`
