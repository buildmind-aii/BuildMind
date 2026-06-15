/**
 * Public types for the BuildMind server entry point.
 *
 * The server is a transport-agnostic factory: callers inject the static-root
 * directory and an optional browser-open side effect. Everything returned is
 * observable so tests can verify behavior through the public interface only.
 */

export interface StartServerOptions {
  /** Port to bind. `0` requests an OS-assigned ephemeral port. Default: 0. */
  readonly port?: number
  /** Host to bind. Default: '127.0.0.1'. */
  readonly host?: string
  /** Absolute path to the directory of built static assets to serve. */
  readonly staticRoot: string
  /**
   * Side effect invoked once the server is listening, with the resolved URL.
   * Injected so tests can observe it without opening a real browser window.
   * Default: a no-op.
   */
  readonly openBrowser?: (url: string) => void
}

export interface ServerHandle {
  /** Fully-resolved URL the server is listening on. */
  readonly url: string
  /** Bound port (the OS-assigned port when `port: 0` was requested). */
  readonly port: number
  /** Stops the server and releases the port. Resolves once closed. */
  close(): Promise<void>
}
