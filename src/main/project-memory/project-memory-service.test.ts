import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtemp, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { ProjectMemoryService } from './project-memory-service'

describe('ProjectMemoryService', () => {
  let tempDir: string
  let service: ProjectMemoryService

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'orca-memory-test-'))
    service = new ProjectMemoryService({ maxCharacters: 5000 })
  })

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true })
  })

  it('initializes .orca/MEMORY.md if not present', async () => {
    const memoryPath = await service.ensureMemoryFile(tempDir)
    expect(memoryPath).toContain('.orca/MEMORY.md')

    const content = await service.loadMemoryContent(tempDir)
    expect(content).toContain('Project Living Memory')
    expect(content).toContain('Project Conventions')
  })

  it('appends notes with timestamp', async () => {
    await service.ensureMemoryFile(tempDir)
    await service.appendNote(tempDir, 'conventions', 'Luôn dùng TypeScript strict mode.')

    const content = await service.loadMemoryContent(tempDir)
    expect(content).toContain('Luôn dùng TypeScript strict mode.')
  })

  it('formats prompt injection XML block cleanly', async () => {
    const prompt = await service.getPromptInjection(tempDir)
    expect(prompt).toContain('<project_memory>')
    expect(prompt).toContain('</project_memory>')
    expect(prompt).toContain('Project Living Memory')
  })

  it('respects max character limits for token budgeting', async () => {
    const shortService = new ProjectMemoryService({ maxCharacters: 50 })
    await shortService.ensureMemoryFile(tempDir)
    const content = await shortService.loadMemoryContent(tempDir)
    expect(content).toContain('... [Nội dung Living Memory đã được rút gọn')
  })
})
