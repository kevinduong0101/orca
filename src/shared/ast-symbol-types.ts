export type SymbolKind = 'function' | 'class' | 'interface' | 'type' | 'variable' | 'enum'

export type CodeSymbol = {
  name: string
  kind: SymbolKind
  filePath: string
  line: number
  column: number
  exported: boolean
  signature?: string
}

export type SymbolIndexSummary = {
  totalSymbols: number
  totalFiles: number
  generatedAt: string
  durationMs: number
}

export type SymbolLookupOptions = {
  kind?: SymbolKind
  limit?: number
  exact?: boolean
}
