import { existsSync } from 'node:fs'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, basename } from 'node:path'
import type {
  PlanDocument,
  PlanPhase,
  PlanTask,
  PlanTaskStatus
} from '../../shared/plan-board-types'

export type PlanProgressMetrics = {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  percentComplete: number
}

export class PlanParserService {
  /**
   * Phân tích nội dung markdown thành cấu trúc PlanDocument có phân cấp Phase và Task.
   */
  parseMarkdown(content: string, filePath = ''): PlanDocument {
    const lines = content.split('\n')
    const id = filePath ? basename(filePath, '.md') : `plan-${Date.now()}`

    let title = ''
    let goal = ''
    const phases: PlanPhase[] = []
    let currentPhase: PlanPhase | null = null
    let taskCounter = 1
    let phaseCounter = 1

    for (const rawLine of lines) {
      const line = rawLine.trim()

      if (line.startsWith('# ') && !title) {
        title = line.slice(2).trim()
        continue
      }

      if (line.startsWith('> Goal:') || line.startsWith('> Mục tiêu:')) {
        goal = line.replace(/^>\s*(Goal|Mục tiêu):\s*/i, '').trim()
        continue
      }

      // Nhận diện Phase heading (## Phase 1: ... hoặc ## Giai đoạn 1: ...)
      if (line.startsWith('## ')) {
        const phaseTitle = line.slice(3).trim()
        currentPhase = {
          id: `phase-${phaseCounter}`,
          title: phaseTitle,
          tasks: [],
          status: 'pending'
        }
        phaseCounter += 1
        phases.push(currentPhase)
        continue
      }

      // Nhận diện task checkbox (- [ ] task name hoặc - [x] task name)
      const checkboxMatch = line.match(/^[-*]\s*\[([ xX\-/])\]\s*(.+)$/)
      if (checkboxMatch) {
        if (!currentPhase) {
          currentPhase = {
            id: `phase-${phaseCounter}`,
            title: 'Giai đoạn chung',
            tasks: [],
            status: 'pending'
          }
          phaseCounter += 1
          phases.push(currentPhase)
        }

        const mark = checkboxMatch[1]?.toLowerCase()
        const taskTitle = checkboxMatch[2]?.trim() ?? ''
        let status: PlanTaskStatus = 'pending'

        if (mark === 'x') {
          status = 'completed'
        } else if (mark === '-' || mark === '/') {
          status = 'in_progress'
        }

        const task: PlanTask = {
          id: `task-${taskCounter}`,
          title: taskTitle,
          status
        }
        taskCounter += 1
        currentPhase.tasks.push(task)
      }
    }

    // Tự động tính status cho từng Phase
    for (const phase of phases) {
      const allDone = phase.tasks.length > 0 && phase.tasks.every((t) => t.status === 'completed')
      const hasWorking = phase.tasks.some(
        (t) => t.status === 'in_progress' || t.status === 'completed'
      )

      if (allDone) {
        phase.status = 'completed'
      } else if (hasWorking) {
        phase.status = 'in_progress'
      } else {
        phase.status = 'pending'
      }
    }

    const now = new Date().toISOString()
    return {
      id,
      title: title || 'Kế hoạch triển khai',
      goal,
      phases,
      createdAt: now,
      updatedAt: now,
      filePath
    }
  }

  /**
   * Chuyển đổi ngược lại từ PlanDocument thành văn bản Markdown tiêu chuẩn.
   */
  serializeToMarkdown(plan: PlanDocument): string {
    const lines: string[] = []
    lines.push(`# ${plan.title}`)
    if (plan.goal) {
      lines.push(`> Mục tiêu: ${plan.goal}`)
    }
    lines.push('')

    for (const phase of plan.phases) {
      lines.push(`## ${phase.title}`)
      if (phase.description) {
        lines.push(`_${phase.description}_`)
      }

      for (const task of phase.tasks) {
        let box = '[ ]'
        if (task.status === 'completed') {
          box = '[x]'
        } else if (task.status === 'in_progress') {
          box = '[-]'
        }

        lines.push(`- ${box} ${task.title}`)
      }
      lines.push('')
    }

    return `${lines.join('\n').trim()}\n`
  }

  /**
   * Tính toán tỷ lệ phần trăm và tiến độ tổng thể của kế hoạch.
   */
  getMetrics(plan: PlanDocument): PlanProgressMetrics {
    let totalTasks = 0
    let completedTasks = 0
    let inProgressTasks = 0

    for (const phase of plan.phases) {
      for (const task of phase.tasks) {
        totalTasks += 1
        if (task.status === 'completed') {
          completedTasks += 1
        } else if (task.status === 'in_progress') {
          inProgressTasks += 1
        }
      }
    }

    const percentComplete = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      percentComplete
    }
  }

  /**
   * Cập nhật trạng thái của một Task cụ thể.
   */
  updateTaskStatus(plan: PlanDocument, taskId: string, newStatus: PlanTaskStatus): PlanDocument {
    const newPhases = plan.phases.map((phase) => ({
      ...phase,
      tasks: phase.tasks.map((task) => {
        if (task.id === taskId) {
          return { ...task, status: newStatus }
        }
        return task
      })
    }))

    return {
      ...plan,
      phases: newPhases,
      updatedAt: new Date().toISOString()
    }
  }

  /**
   * Đọc file plan từ disk.
   */
  async loadPlanFile(filePath: string): Promise<PlanDocument | null> {
    if (!existsSync(filePath)) {
      return null
    }

    try {
      const content = await readFile(filePath, 'utf-8')
      return this.parseMarkdown(content, filePath)
    } catch {
      return null
    }
  }

  /**
   * Ghi file plan xuống disk.
   */
  async savePlanFile(plan: PlanDocument, filePath: string): Promise<void> {
    const markdown = this.serializeToMarkdown(plan)
    const dir = join(filePath, '..')
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true })
    }

    await writeFile(filePath, markdown, 'utf-8')
  }
}
