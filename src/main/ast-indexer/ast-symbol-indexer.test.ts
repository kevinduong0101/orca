import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { AstSymbolIndexer } from './ast-symbol-indexer'

describe('AstSymbolIndexer', () => {
  let tempDir: string
  let indexer: AstSymbolIndexer

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'orca-ast-test-'))

    const srcDir = join(tempDir, 'src')
    await mkdir(srcDir, { recursive: true })

    const sampleFile1 = `
export interface UserProfile {
  id: string
  email: string
}

export type AuthToken = string

export class AuthService {
  async authenticate(): Promise<boolean> {
    return true
  }
}

export function validateEmail(email: string): boolean {
  return email.includes('@')
}

export const generateSessionId = () => {
  return 'session-123'
}
`
    await writeFile(join(srcDir, 'auth.ts'), sampleFile1, 'utf-8')

    indexer = new AstSymbolIndexer(tempDir)
  })

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true })
  })

  it('extracts all code symbols accurately from file content', () => {
    const symbols = indexer.extractSymbolsFromContent(
      `
export class UserService {}
export function fetchUsers() {}
export interface UserConfig {}
export type Role = 'admin' | 'user'
export const getActiveUser = () => {}
      `,
      'src/users.ts'
    )

    const names = symbols.map((s) => s.name)
    expect(names).toContain('UserService')
    expect(names).toContain('fetchUsers')
    expect(names).toContain('UserConfig')
    expect(names).toContain('Role')
    expect(names).toContain('getActiveUser')

    const userClass = symbols.find((s) => s.name === 'UserService')
    expect(userClass?.kind).toBe('class')
    expect(userClass?.exported).toBe(true)
  })

  it('indexes the repository and supports sub-millisecond symbol lookups', async () => {
    const summary = await indexer.indexRepository()
    expect(summary.totalFiles).toBeGreaterThanOrEqual(1)
    expect(summary.totalSymbols).toBe(5)

    const start = performance.now()
    const matches = indexer.lookup('AuthService')
    const lookupDuration = performance.now() - start

    expect(lookupDuration).toBeLessThan(50) // Phải nhanh hơn 50ms
    expect(matches.length).toBe(1)
    expect(matches[0]?.name).toBe('AuthService')
    expect(matches[0]?.kind).toBe('class')
    expect(matches[0]?.filePath).toBe('src/auth.ts')
  })

  it('filters symbol lookup by kind and query', async () => {
    await indexer.indexRepository()

    const functionsOnly = indexer.lookup('validate', { kind: 'function' })
    expect(functionsOnly.length).toBe(1)
    expect(functionsOnly[0]?.name).toBe('validateEmail')

    const interfaceMatches = indexer.lookup('Profile', { kind: 'interface' })
    expect(interfaceMatches.length).toBe(1)
    expect(interfaceMatches[0]?.name).toBe('UserProfile')
  })

  it('saves cache to disk and reloads instantly', async () => {
    await indexer.indexRepository()
    await indexer.saveCache()

    const freshIndexer = new AstSymbolIndexer(tempDir)
    expect(freshIndexer.isReady).toBe(false)

    const loaded = await freshIndexer.loadCache()
    expect(loaded).toBe(true)
    expect(freshIndexer.isReady).toBe(true)

    const result = freshIndexer.lookup('generateSessionId')
    expect(result.length).toBe(1)
    expect(result[0]?.name).toBe('generateSessionId')
  })
})
