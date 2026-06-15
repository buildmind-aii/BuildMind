// @vitest-environment jsdom
import { describe, test, expect, beforeAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

let tokens: string

beforeAll(() => {
  tokens = readFileSync(resolve(__dirname, 'tokens.css'), 'utf-8')
})

describe('Design tokens — CSS variables from DESIGN.md', () => {
  test('defines dark background token', () => {
    expect(tokens).toContain('--background: oklch(0.145 0 0)')
  })

  test('defines dark foreground token', () => {
    expect(tokens).toContain('--foreground: oklch(0.985 0 0)')
  })

  test('defines dark sidebar token', () => {
    expect(tokens).toContain('--sidebar: oklch(0.205 0 0)')
  })

  test('defines dark sidebar foreground token', () => {
    expect(tokens).toContain('--sidebar-foreground: oklch(0.985 0 0)')
  })

  test('defines dark card token', () => {
    expect(tokens).toContain('--card: oklch(0.205 0 0)')
  })

  test('defines dark muted foreground token', () => {
    expect(tokens).toContain('--muted-foreground: oklch(0.708 0 0)')
  })

  test('defines border radius token', () => {
    expect(tokens).toContain('--radius: 0.5rem')
  })

  test('defines dark border token', () => {
    expect(tokens).toContain('--border: oklch(1 0 0 / 10%)')
  })
})
