import fs from 'node:fs'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ProcessHibernationManager } from './process-hibernation-manager'

describe('ProcessHibernationManager', () => {
  const testCacheDir = '/tmp/orca-test-hibernation'
  let manager: ProcessHibernationManager

  beforeEach(() => {
    if (fs.existsSync(testCacheDir)) {
      fs.rmSync(testCacheDir, { recursive: true, force: true })
    }
    manager = new ProcessHibernationManager({
      idleThresholdMs: 5000,
      cacheDir: testCacheDir
    })
  })

  afterEach(() => {
    manager.clear()
    if (fs.existsSync(testCacheDir)) {
      fs.rmSync(testCacheDir, { recursive: true, force: true })
    }
  })

  it('registers session and tracks buffer additions', () => {
    const session = manager.registerSession('term-1', 'wt-auth')
    expect(session.state).toBe('active')
    expect(session.bufferLineCount).toBe(0)

    manager.appendBuffer('term-1', ['line 1', 'line 2', 'line 3'])
    const updated = manager.getSession('term-1')
    expect(updated?.bufferLineCount).toBe(3)
  })

  it('hibernates buffer to disk and frees memory', () => {
    manager.registerSession('term-2')
    manager.appendBuffer('term-2', ['log line A', 'log line B'])

    const hibernated = manager.hibernateSession('term-2')
    expect(hibernated).toBe(true)

    const session = manager.getSession('term-2')
    expect(session?.state).toBe('hibernated')
    expect(session?.diskCachePath).toBeTruthy()

    const cachePath = session?.diskCachePath ?? ''
    expect(fs.existsSync(cachePath)).toBe(true)

    const fileContent = fs.readFileSync(cachePath, 'utf8')
    expect(fileContent).toBe('log line A\nlog line B')
  })

  it('wakes hibernated session and restores buffer content', () => {
    manager.registerSession('term-3')
    manager.appendBuffer('term-3', ['initial message'])
    manager.hibernateSession('term-3')

    const restoredLines = manager.wakeSession('term-3')
    expect(restoredLines).toEqual(['initial message'])

    const session = manager.getSession('term-3')
    expect(session?.state).toBe('active')
    expect(session?.hibernatedAt).toBeUndefined()
  })

  it('detects idle sessions and hibernates them automatically', () => {
    manager.registerSession('term-idle')
    manager.appendBuffer('term-idle', ['idle line 1'])

    manager.registerSession('term-busy')
    manager.appendBuffer('term-busy', ['busy line 1'])

    const futureTime = Date.now() + 6000
    // Keep term-busy fresh
    const busySession = manager.getSession('term-busy')
    if (busySession) {
      busySession.lastActiveTimestamp = futureTime
    }

    const hibernatedIds = manager.checkAndHibernateIdleSessions(futureTime)
    expect(hibernatedIds).toEqual(['term-idle'])
    expect(manager.getSession('term-idle')?.state).toBe('hibernated')
    expect(manager.getSession('term-busy')?.state).toBe('active')
  })

  it('calculates accurate hibernation metrics', () => {
    manager.registerSession('term-a')
    manager.appendBuffer('term-a', ['1', '2', '3'])

    manager.registerSession('term-b')
    manager.appendBuffer('term-b', ['10', '20'])
    manager.hibernateSession('term-b')

    const metrics = manager.getMetrics()
    expect(metrics.totalSessions).toBe(2)
    expect(metrics.activeSessions).toBe(1)
    expect(metrics.hibernatedSessions).toBe(1)
    expect(metrics.estimatedSavedMemoryBytes).toBeGreaterThan(10 * 1024 * 1024)
  })
})
