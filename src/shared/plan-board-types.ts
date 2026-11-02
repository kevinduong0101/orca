export type PlanTaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed'

export type PlanTask = {
  id: string
  title: string
  status: PlanTaskStatus
  description?: string
  assignedAgent?: string
  worktreeBranch?: string
  files?: string[]
}

export type PlanPhase = {
  id: string
  title: string
  description?: string
  tasks: PlanTask[]
  status: 'pending' | 'in_progress' | 'completed'
}

export type PlanDocument = {
  id: string
  title: string
  goal?: string
  phases: PlanPhase[]
  createdAt: string
  updatedAt: string
  filePath?: string
}
