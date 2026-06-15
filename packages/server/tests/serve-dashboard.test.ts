import { describe, test, expect, afterEach } from 'vitest'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { startServer } from '../src/index.js'
import type { ServerHandle } from '../src/types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const fixtureRoot = resolve(__dirname, 'fixtures/static-root')

const handles: ServerHandle[] = []
async function start(opts: Parameters<typeof startServer>[0]): Promise<ServerHandle> {
  const h = await startServer(opts)
  handles.push(h)
  return h
}
afterEach(async () => {
  while (handles.length) await handles.pop()?.close()
})

describe('startServer — serving the dashboard', () => {
  test('GET / returns 200 with the dashboard HTML', async () => {
    const server = await start({ staticRoot: fixtureRoot })

    const res = await fetch(server.url)

    expect(res.status).toBe(200)
    expect(await res.text()).toContain('dashboard fixture')
  })
})

describe('startServer — port binding', () => {
  test('port: 0 binds an OS-assigned ephemeral port', async () => {
    const server = await start({ staticRoot: fixtureRoot, port: 0 })

    expect(server.port).toBeGreaterThan(0)
    expect(server.url).toContain(`:${server.port}`)
  })

  test('two servers on port 0 get distinct ports', async () => {
    const a = await start({ staticRoot: fixtureRoot, port: 0 })
    const b = await start({ staticRoot: fixtureRoot, port: 0 })

    expect(a.port).not.toBe(b.port)
  })
})
