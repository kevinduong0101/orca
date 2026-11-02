import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtemp, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { PlanParserService } from './plan-parser-service'

describe('PlanParserService', () => {
  let tempDir: string
  let service: PlanParserService

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'orca-plan-test-'))
    service = new PlanParserService()
  })

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true })
  })

  const sampleMarkdown = `# Triển khai tính năng Authentication
> Mục tiêu: Hỗ trợ đăng nhập JWT và Google OAuth

## Phase 1: Database Schema & Core Logic
- [x] Tạo user model trong Prisma
- [-] Viết migration script
- [ ] Cấu hình JWT signing key

## Phase 2: API Endpoints & Testing
- [ ] Endpoint POST /api/auth/login
- [ ] Unit tests cho auth service
`

  it('correctly parses markdown with phases, tasks and statuses', () => {
    const plan = service.parseMarkdown(sampleMarkdown, 'sample-plan.md')
    expect(plan.title).toBe('Triển khai tính năng Authentication')
    expect(plan.goal).toBe('Hỗ trợ đăng nhập JWT và Google OAuth')
    expect(plan.phases.length).toBe(2)

    const phase1 = plan.phases[0]
    expect(phase1?.title).toBe('Phase 1: Database Schema & Core Logic')
    expect(phase1?.tasks.length).toBe(3)
    expect(phase1?.tasks[0]?.status).toBe('completed')
    expect(phase1?.tasks[1]?.status).toBe('in_progress')
    expect(phase1?.tasks[2]?.status).toBe('pending')
  })

  it('calculates plan metrics accurately', () => {
    const plan = service.parseMarkdown(sampleMarkdown)
    const metrics = service.getMetrics(plan)

    expect(metrics.totalTasks).toBe(5)
    expect(metrics.completedTasks).toBe(1)
    expect(metrics.inProgressTasks).toBe(1)
    expect(metrics.percentComplete).toBe(20) // 1 out of 5 = 20%
  })

  it('updates task status and recalculates progress', () => {
    const plan = service.parseMarkdown(sampleMarkdown)
    const updated = service.updateTaskStatus(plan, 'task-2', 'completed')
    const metrics = service.getMetrics(updated)

    expect(metrics.completedTasks).toBe(2)
    expect(metrics.percentComplete).toBe(40) // 2 out of 5 = 40%
  })

  it('serializes plan document back into standard markdown', () => {
    const plan = service.parseMarkdown(sampleMarkdown)
    const serialized = service.serializeToMarkdown(plan)

    expect(serialized).toContain('# Triển khai tính năng Authentication')
    expect(serialized).toContain('> Mục tiêu: Hỗ trợ đăng nhập JWT và Google OAuth')
    expect(serialized).toContain('- [x] Tạo user model trong Prisma')
    expect(serialized).toContain('- [-] Viết migration script')
    expect(serialized).toContain('- [ ] Cấu hình JWT signing key')
  })

  it('saves and loads plan file on disk seamlessly', async () => {
    const plan = service.parseMarkdown(sampleMarkdown)
    const filePath = join(tempDir, 'auth-plan.md')

    await service.savePlanFile(plan, filePath)
    const loaded = await service.loadPlanFile(filePath)

    expect(loaded).not.toBeNull()
    expect(loaded?.title).toBe('Triển khai tính năng Authentication')
    expect(loaded?.phases.length).toBe(2)
  })
})
