export type SlashCommandSource = 'global' | 'project' | 'plugin'

export type SlashCommandEntry = {
  id: string
  name: string
  description: string
  prompt: string
  source: SlashCommandSource
  sourcePath?: string
  argumentHint?: string
}
