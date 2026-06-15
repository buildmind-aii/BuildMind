import { describe, test, expect, afterEach, vi } from 'vitest'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { runCli } from '../src/cli.js'
import type { ServerHandle } from '../src/types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const fixtureRoot = resolve(__dirname, 'fixtures/static-root')

const handles: ServerHandle[] = []

afterEach(async () => {
  while (handles.length) await handles.pop()?.close()
})

describe('runCli', () => {
  test('starts server and returns the URL', async () => {
    const { url, server } = await runCli({ staticRoot: fixtureRoot })
    handles.push(server)

    expect(url).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/)
  })

  test('calls openBrowser with the resolved URL', async () => {
    const openBrowser = vi.fn()
    const { url, server } = await runCli({ staticRoot: fixtureRoot, openBrowser })
    handles.push(server)

    expect(openBrowser).toHaveBeenCalledOnce()
    expect(openBrowser).toHaveBeenCalledWith(url)
  })

  test('shutdown closes the server and rejects further requests', async () => {
    const { url, shutdown } = await runCli({ staticRoot: fixtureRoot })

    const res = await fetch(url)
    expect(res.status).toBe(200)

    await shutdown()

    await expect(fetch(url)).rejects.toThrow()
  })
})
