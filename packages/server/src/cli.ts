import { startServer } from './index.js'
import type { ServerHandle } from './types.js'

export interface CliOptions {
  readonly staticRoot: string
  readonly openBrowser?: (url: string) => void
}

export interface CliResult {
  readonly url: string
  readonly server: ServerHandle
  readonly shutdown: () => Promise<void>
}

export async function runCli(options: CliOptions): Promise<CliResult> {
  const server = await startServer({
    staticRoot: options.staticRoot,
    ...(options.openBrowser !== undefined && { openBrowser: options.openBrowser })
  })

  return {
    url: server.url,
    server,
    shutdown: () => server.close()
  }
}
