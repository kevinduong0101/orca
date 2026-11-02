import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { UnifiedCommandRegistry } from './unified-command-registry'

describe('UnifiedCommandRegistry', () => {
  let tempGlobalDir: string
  let tempProjectDir: string
  let registry: UnifiedCommandRegistry

  beforeEach(async () => {
    tempGlobalDir = await mkdtemp(join(tmpdir(), 'orca-global-cmds-'))
    tempProjectDir = await mkdtemp(join(tmpdir(), 'orca-proj-cmds-'))

    const projOrcaCmds = join(tempProjectDir, '.orca', 'commands')
    await mkdir(projOrcaCmds, { recursive: true })

    // Tạo lệnh global
    await writeFile(
      join(tempGlobalDir, 'ponytail.toml'),
      'description = "Lazy senior dev mode"\nprompt = "Switch to ponytail {{args}} mode."',
      'utf-8'
    )
    await writeFile(
      join(tempGlobalDir, 'review.toml'),
      'description = "Review code quality"\nprompt = "Review this PR rigorously."',
      'utf-8'
    )

    // Tạo lệnh project (ghi đè lệnh global review)
    await writeFile(
      join(projOrcaCmds, 'review.toml'),
      'description = "Project custom code review"\nprompt = "Review strictly against our project conventions."',
      'utf-8'
    )
    await writeFile(
      join(projOrcaCmds, 'spec.toml'),
      'description = "Spec driven development"\nprompt = "Write specs first."',
      'utf-8'
    )

    registry = new UnifiedCommandRegistry({
      globalDirs: [tempGlobalDir],
      projectRoot: tempProjectDir
    })
  })

  afterEach(async () => {
    await rm(tempGlobalDir, { recursive: true, force: true })
    await rm(tempProjectDir, { recursive: true, force: true })
  })

  it('scans and merges commands from both global and project sources', async () => {
    const commands = await registry.loadCommands()
    expect(commands.length).toBe(3) // ponytail (global), spec (project), review (overridden)

    const ids = commands.map((c) => c.id)
    expect(ids).toContain('ponytail')
    expect(ids).toContain('spec')
    expect(ids).toContain('review')
  })

  it('allows project command to override global command with the same id', async () => {
    const commands = await registry.loadCommands()
    const reviewCmd = commands.find((c) => c.id === 'review')
    expect(reviewCmd?.source).toBe('project')
    expect(reviewCmd?.description).toBe('Project custom code review')
  })

  it('filters commands by query string', async () => {
    await registry.loadCommands()
    const filtered = registry.filterCommands('/pony')
    expect(filtered.length).toBe(1)
    expect(filtered[0]?.id).toBe('ponytail')

    const byDesc = registry.filterCommands('convention')
    expect(byDesc.length).toBe(1)
    expect(byDesc[0]?.id).toBe('review')
  })

  it('resolves {{args}} in prompt replacement', async () => {
    await registry.loadCommands()
    const prompt = registry.resolveCommandPrompt('ponytail', 'ultra')
    expect(prompt).toBe('Switch to ponytail ultra mode.')
  })
})
