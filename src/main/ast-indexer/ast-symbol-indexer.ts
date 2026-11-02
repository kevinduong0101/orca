import { existsSync } from 'node:fs'
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, relative } from 'node:path'
import type {
  CodeSymbol,
  SymbolIndexSummary,
  SymbolLookupOptions
} from '../../shared/ast-symbol-types'

const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  '.cache',
  'dist',
  'out',
  'build',
  'coverage',
  '.husky'
])

const SUPPORTED_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.py', '.rs', '.go'])

export class AstSymbolIndexer {
  private symbols: CodeSymbol[] = []
  private readonly symbolMap = new Map<string, CodeSymbol[]>()
  private isIndexed = false

  constructor(private readonly projectRoot: string) {}

  /**
   * Trích xuất các symbols (function, class, interface, type, enum) từ nội dung file.
   */
  extractSymbolsFromContent(content: string, relativePath: string): CodeSymbol[] {
    const symbols: CodeSymbol[] = []
    const lines = content.split('\n')

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i] ?? ''
      const lineNum = i + 1

      // 1. Exported or regular functions: function foo(...) hoặc export function foo(...)
      const fnMatch = line.match(/^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(/)
      if (fnMatch?.[1]) {
        symbols.push({
          name: fnMatch[1],
          kind: 'function',
          filePath: relativePath,
          line: lineNum,
          column: line.indexOf(fnMatch[1]),
          exported: line.startsWith('export'),
          signature: line.trim()
        })
        continue
      }

      // 2. Classes: class Foo ... hoặc export class Foo ...
      const classMatch = line.match(/^(?:export\s+)?(?:abstract\s+)?class\s+([A-Za-z0-9_$]+)/)
      if (classMatch?.[1]) {
        symbols.push({
          name: classMatch[1],
          kind: 'class',
          filePath: relativePath,
          line: lineNum,
          column: line.indexOf(classMatch[1]),
          exported: line.startsWith('export'),
          signature: line.trim()
        })
        continue
      }

      // 3. Interfaces: interface Foo ... hoặc export interface Foo ...
      const ifaceMatch = line.match(/^(?:export\s+)?interface\s+([A-Za-z0-9_$]+)/)
      if (ifaceMatch?.[1]) {
        symbols.push({
          name: ifaceMatch[1],
          kind: 'interface',
          filePath: relativePath,
          line: lineNum,
          column: line.indexOf(ifaceMatch[1]),
          exported: line.startsWith('export'),
          signature: line.trim()
        })
        continue
      }

      // 4. Types: type Foo = ... hoặc export type Foo = ...
      const typeMatch = line.match(/^(?:export\s+)?type\s+([A-Za-z0-9_$]+)\s*=/)
      if (typeMatch?.[1]) {
        symbols.push({
          name: typeMatch[1],
          kind: 'type',
          filePath: relativePath,
          line: lineNum,
          column: line.indexOf(typeMatch[1]),
          exported: line.startsWith('export'),
          signature: line.trim()
        })
        continue
      }

      // 5. Enums: enum Foo { ... hoặc export enum Foo { ...
      const enumMatch = line.match(/^(?:export\s+)?enum\s+([A-Za-z0-9_$]+)/)
      if (enumMatch?.[1]) {
        symbols.push({
          name: enumMatch[1],
          kind: 'enum',
          filePath: relativePath,
          line: lineNum,
          column: line.indexOf(enumMatch[1]),
          exported: line.startsWith('export'),
          signature: line.trim()
        })
        continue
      }

      // 6. Arrow functions / Constants: export const foo = (...) => ...
      const arrowMatch = line.match(
        /^(?:export\s+)?const\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z0-9_$]+)\s*=>/
      )
      if (arrowMatch?.[1]) {
        symbols.push({
          name: arrowMatch[1],
          kind: 'function',
          filePath: relativePath,
          line: lineNum,
          column: line.indexOf(arrowMatch[1]),
          exported: line.startsWith('export'),
          signature: line.trim()
        })
      }
    }

    return symbols
  }

  /**
   * Quét toàn bộ repository và đánh chỉ mục symbols.
   */
  async indexRepository(maxFiles = 5000): Promise<SymbolIndexSummary> {
    const startTime = Date.now()
    this.symbols = []
    this.symbolMap.clear()

    const filesToIndex = await this.scanFiles(this.projectRoot, maxFiles)
    for (const fullPath of filesToIndex) {
      try {
        const content = await readFile(fullPath, 'utf-8')
        const relPath = relative(this.projectRoot, fullPath)
        const extracted = this.extractSymbolsFromContent(content, relPath)

        for (const sym of extracted) {
          this.symbols.push(sym)
          const lowerName = sym.name.toLowerCase()
          const existing = this.symbolMap.get(lowerName) ?? []
          existing.push(sym)
          this.symbolMap.set(lowerName, existing)
        }
      } catch {
        // Bỏ qua lỗi đọc file
      }
    }

    this.isIndexed = true
    const durationMs = Date.now() - startTime

    return {
      totalSymbols: this.symbols.length,
      totalFiles: filesToIndex.length,
      generatedAt: new Date().toISOString(),
      durationMs
    }
  }

  private async scanFiles(dir: string, maxFiles: number): Promise<string[]> {
    const results: string[] = []

    const traverse = async (currentDir: string): Promise<void> => {
      if (results.length >= maxFiles) {
        return
      }

      try {
        const entries = await readdir(currentDir, { withFileTypes: true })
        for (const entry of entries) {
          if (results.length >= maxFiles) {
            break
          }

          if (entry.isDirectory()) {
            if (!IGNORED_DIRS.has(entry.name)) {
              await traverse(join(currentDir, entry.name))
            }
          } else if (entry.isFile()) {
            const extIndex = entry.name.lastIndexOf('.')
            if (extIndex !== -1) {
              const ext = entry.name.slice(extIndex).toLowerCase()
              if (SUPPORTED_EXTS.has(ext)) {
                results.push(join(currentDir, entry.name))
              }
            }
          }
        }
      } catch {
        // Bỏ qua lỗi truy cập thư mục
      }
    }

    await traverse(dir)
    return results
  }

  /**
   * Tra cứu vị trí của Symbol siêu tốc trong <50ms.
   */
  lookup(query: string, options: SymbolLookupOptions = {}): CodeSymbol[] {
    const cleanQuery = query.toLowerCase().trim()
    if (!cleanQuery) {
      return []
    }

    const limit = options.limit ?? 20
    const results: CodeSymbol[] = []

    // 1. Kiểm tra exact match trước
    const exactMatches = this.symbolMap.get(cleanQuery)
    if (exactMatches) {
      for (const sym of exactMatches) {
        if (!options.kind || sym.kind === options.kind) {
          results.push(sym)
          if (results.length >= limit) {
            return results
          }
        }
      }
    }

    if (options.exact) {
      return results
    }

    // 2. Tìm kiếm chứa từ khóa (substring search)
    for (const [name, syms] of this.symbolMap.entries()) {
      if (name !== cleanQuery && name.includes(cleanQuery)) {
        for (const sym of syms) {
          if (!options.kind || sym.kind === options.kind) {
            results.push(sym)
            if (results.length >= limit) {
              return results
            }
          }
        }
      }
    }

    return results
  }

  /**
   * Lưu index symbols xuống đĩa để khởi động tức thì lần sau.
   */
  async saveCache(): Promise<void> {
    const cacheDir = join(this.projectRoot, '.orca', 'cache')
    if (!existsSync(cacheDir)) {
      await mkdir(cacheDir, { recursive: true })
    }

    const cacheFile = join(cacheDir, 'symbols.json')
    await writeFile(cacheFile, JSON.stringify(this.symbols), 'utf-8')
  }

  /**
   * Tải index symbols từ cache đĩa.
   */
  async loadCache(): Promise<boolean> {
    const cacheFile = join(this.projectRoot, '.orca', 'cache', 'symbols.json')
    if (!existsSync(cacheFile)) {
      return false
    }

    try {
      const data = await readFile(cacheFile, 'utf-8')
      const parsed = JSON.parse(data) as CodeSymbol[]

      this.symbols = parsed
      this.symbolMap.clear()
      for (const sym of this.symbols) {
        const lowerName = sym.name.toLowerCase()
        const existing = this.symbolMap.get(lowerName) ?? []
        existing.push(sym)
        this.symbolMap.set(lowerName, existing)
      }

      this.isIndexed = true
      return true
    } catch {
      return false
    }
  }

  get isReady(): boolean {
    return this.isIndexed
  }
}
