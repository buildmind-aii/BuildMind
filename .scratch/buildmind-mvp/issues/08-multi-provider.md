Status: ready-for-agent

# Multi-Provider Integration (Anthropic, Google, DeepSeek, OpenRouter, NVIDIA)

## Parent

`.scratch/buildmind-mvp/PRD.md`

## What to build

Integrate the remaining 5 LLM providers into the agent loop, alongside the existing OpenAI integration from slice 3. Each provider uses the Vercel AI SDK's provider package:

- Anthropic (`@ai-sdk/anthropic`)
- Google Gemini (`@ai-sdk/google`)
- DeepSeek (`@ai-sdk/deepseek`)
- OpenRouter (`@openrouter/ai-sdk-provider`)
- NVIDIA NIM (`@ai-sdk/openai-compatible`)

A provider router reads the user's selected provider and model from `.buildmind/config.json` and initializes the correct Vercel AI SDK provider. The model selection dropdown in settings lets users choose a specific model per provider. OpenRouter and NVIDIA NIM are configured as free-tier options (no API key required for basic usage).

## Acceptance criteria

- [ ] All 5 provider packages are installed and importable
- [ ] Provider router resolves the correct provider based on user's config selection
- [ ] User can select a provider and specific model in settings
- [ ] Agent loop works with each provider (streaming + tool use)
- [ ] OpenRouter and NVIDIA NIM work without requiring an API key (free-tier)
- [ ] Tests verify provider routing with mock HTTP servers

## Blocked by

- `.scratch/buildmind-mvp/issues/03-workspace-agent-loop.md`
- `.scratch/buildmind-mvp/issues/07-settings-page.md`
