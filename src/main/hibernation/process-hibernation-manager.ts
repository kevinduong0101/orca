import fs from 'node:fs'
import path from 'node:path'
import type {
  HibernationConfig,
  HibernationMetrics,
  TerminalSessionInfo
} from '../../shared/hibernation-types'

export class ProcessHibernationManager {
  private config: HibernationConfig
  private sessions = new Map<string, TerminalSessionInfo>()
  private inMemoryBuffers = new Map<string, string[]>()

  public constructor(config?: Partial<HibernationConfig>) {
    this.config = {
      idleThresholdMs: config?.idleThresholdMs ?? 10 * 60 * 1000,
      cacheDir: config?.cacheDir ?? path.join(process.cwd(), '.orca', 'cache', 'terminals')
    }

    if (!fs.existsSync(this.config.cacheDir)) {
      try {
        fs.mkdirSync(this.config.cacheDir, { recursive: true })
      } catch (err) {
        console.error('Failed to create hibernation cache directory:', err)
      }
    }
  }

  public registerSession(terminalId: string, worktreeId?: string): TerminalSessionInfo {
    const existing = this.sessions.get(terminalId)
    if (existing) {
      return existing
    }

    const session: TerminalSessionInfo = {
      terminalId,
      worktreeId,
      state: 'active',
      lastActiveTimestamp: Date.now(),
      bufferLineCount: 0
    }

    this.sessions.set(terminalId, session)
    this.inMemoryBuffers.set(terminalId, [])
    return session
  }

  public touchSession(terminalId: string): void {
    const session = this.sessions.get(terminalId)
    if (!session) {
      return
    }

    session.lastActiveTimestamp = Date.now()
    if (session.state === 'hibernated') {
      this.wakeSession(terminalId)
    }
  }

  public appendBuffer(terminalId: string, lines: string[]): void {
    let session = this.sessions.get(terminalId)
    if (!session) {
      session = this.registerSession(terminalId)
    }

    session.lastActiveTimestamp = Date.now()

    if (session.state === 'hibernated') {
      this.wakeSession(terminalId)
    }

    const buf = this.inMemoryBuffers.get(terminalId) ?? []
    buf.push(...lines)
    this.inMemoryBuffers.set(terminalId, buf)
    session.bufferLineCount = buf.length
  }

  public hibernateSession(terminalId: string): boolean {
    const session = this.sessions.get(terminalId)
    if (!session || session.state === 'hibernated') {
      return false
    }

    const lines = this.inMemoryBuffers.get(terminalId) ?? []
    const cachePath = path.join(this.config.cacheDir, `${terminalId}.log`)

    try {
      fs.writeFileSync(cachePath, lines.join('\n'), 'utf8')
      this.inMemoryBuffers.delete(terminalId)

      session.state = 'hibernated'
      session.hibernatedAt = Date.now()
      session.diskCachePath = cachePath
      return true
    } catch (err) {
      console.error(`Failed to hibernate session ${terminalId}:`, err)
      return false
    }
  }

  public wakeSession(terminalId: string): string[] | null {
    const session = this.sessions.get(terminalId)
    if (!session) {
      return null
    }

    if (session.state === 'active') {
      return this.inMemoryBuffers.get(terminalId) ?? []
    }

    const cachePath = session.diskCachePath
    let lines: string[] = []

    if (cachePath && fs.existsSync(cachePath)) {
      try {
        const fileContent = fs.readFileSync(cachePath, 'utf8')
        lines = fileContent ? fileContent.split('\n') : []
      } catch (err) {
        console.error(`Failed to read hibernation cache for ${terminalId}:`, err)
      }
    }

    this.inMemoryBuffers.set(terminalId, lines)
    session.state = 'active'
    session.hibernatedAt = undefined
    session.lastActiveTimestamp = Date.now()
    session.bufferLineCount = lines.length

    return lines
  }

  public checkAndHibernateIdleSessions(referenceTimestamp: number = Date.now()): string[] {
    const hibernatedIds: string[] = []

    for (const [id, session] of this.sessions.entries()) {
      if (session.state === 'active') {
        const idleDuration = referenceTimestamp - session.lastActiveTimestamp
        if (idleDuration >= this.config.idleThresholdMs) {
          const success = this.hibernateSession(id)
          if (success) {
            hibernatedIds.push(id)
          }
        }
      }
    }

    return hibernatedIds
  }

  public unregisterSession(terminalId: string): void {
    const session = this.sessions.get(terminalId)
    if (session?.diskCachePath && fs.existsSync(session.diskCachePath)) {
      try {
        fs.unlinkSync(session.diskCachePath)
      } catch (err) {
        console.error(`Failed to remove cache file for ${terminalId}:`, err)
      }
    }

    this.sessions.delete(terminalId)
    this.inMemoryBuffers.delete(terminalId)
  }

  public getSession(terminalId: string): TerminalSessionInfo | undefined {
    return this.sessions.get(terminalId)
  }

  public getMetrics(): HibernationMetrics {
    let activeSessions = 0
    let hibernatedSessions = 0
    let totalSavedLines = 0

    for (const session of this.sessions.values()) {
      if (session.state === 'hibernated') {
        hibernatedSessions += 1
        totalSavedLines += session.bufferLineCount
      } else {
        activeSessions += 1
      }
    }

    const estimatedSavedMemoryBytes = hibernatedSessions * 10 * 1024 * 1024 + totalSavedLines * 120

    return {
      totalSessions: this.sessions.size,
      activeSessions,
      hibernatedSessions,
      estimatedSavedMemoryBytes
    }
  }

  public clear(): void {
    for (const id of Array.from(this.sessions.keys())) {
      this.unregisterSession(id)
    }
  }
}
