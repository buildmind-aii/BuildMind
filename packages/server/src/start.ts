#!/usr/bin/env node
import { runCli } from './cli.js'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

function openBrowser(url: string) {
  const platform = process.platform
  const cmd = platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open'
  try {
    execSync(`${cmd} ${url}`, { stdio: 'ignore' })
  } catch {
    // Browser open failed — not critical
  }
}

const staticRoot = resolve(__dirname, '../../../apps/web/dist')

if (!existsSync(staticRoot)) {
  console.error('Build the frontend first: npm run build')
  process.exit(1)
}

const { url, shutdown } = await runCli({
  staticRoot,
  openBrowser
})

console.log(`BuildMind started at ${url}`)

process.on('SIGINT', async () => {
  await shutdown()
  process.exit(0)
})
