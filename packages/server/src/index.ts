import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import type { StartServerOptions, ServerHandle } from './types.js'

const noop = () => {}

/**
 * Start the BuildMind backend on the given port, serving static assets from
 * `staticRoot`. Returns a handle whose `url` and `close()` are the only public
 * surface; printing, browser-opening, and signal handling live in the CLI.
 *
 * `port: 0` requests an OS-assigned ephemeral port (the default).
 */
export async function startServer(options: StartServerOptions): Promise<ServerHandle> {
  const host = options.host ?? '127.0.0.1'
  const requestedPort = options.port ?? 0
  const openBrowser = options.openBrowser ?? noop

  const app = Fastify({ logger: false })
  await app.register(fastifyStatic, { root: options.staticRoot })

  await app.listen({ host, port: requestedPort })

  const address = app.server.address()
  const port = typeof address === 'object' && address ? address.port : requestedPort
  const url = `http://${host}:${port}`

  openBrowser(url)

  return {
    url,
    port,
    async close() {
      await app.close()
    }
  }
}

export { type StartServerOptions, type ServerHandle } from './types.js'
