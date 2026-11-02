import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile, appendFile } from 'node:fs/promises'
import { join } from 'node:path'

export type ProjectMemoryConfig = {
  maxCharacters?: number
  defaultSections?: string[]
}

const DEFAULT_MAX_CHARS = 12000

const INITIAL_MEMORY_TEMPLATE = `# Project Living Memory (.orca/MEMORY.md)
> Tự động nạp vào mọi AI Agent (Claude, Codex, Gemini, Qwen). Cập nhật các quy chuẩn, quyết định kiến trúc và bài học vào đây.

## 1. Project Conventions & Architecture Rules
- Tuân thủ cấu trúc thư mục hiện tại của dự án.
- Viết test trước khi bàn giao (Test-Driven Development).
- Tránh sinh code thừa thãi, ưu tiên dùng chuẩn ngôn ngữ / native platform (Ponytail YAGNI).

## 2. Key Architecture Decisions & Design Freezes
- Ghi nhận các quyết định công nghệ quan trọng (ADRs).
- Không tự ý thay đổi schema cơ sở dữ liệu nếu chưa được phê duyệt.

## 3. Feedback Rules (Những điều người dùng nhắc nhở)
- Luôn giải thích ngắn gọn, đi thẳng vào giải pháp.
- Đảm bảo kiểm tra lỗi type và linter trước khi hoàn tất task.

## 4. Lessons Learned & Bug Post-Mortems
- Các lỗi thư viện hoặc hành vi bất thường đã được xử lý để tránh lặp lại.
`

export class ProjectMemoryService {
  constructor(private readonly config: ProjectMemoryConfig = {}) {}

  private getOrcaDir(projectRoot: string): string {
    return join(projectRoot, '.orca')
  }

  private getMemoryPath(projectRoot: string): string {
    return join(this.getOrcaDir(projectRoot), 'MEMORY.md')
  }

  /**
   * Đảm bảo file .orca/MEMORY.md và thư mục lưu trữ tồn tại.
   */
  async ensureMemoryFile(projectRoot: string): Promise<string> {
    const orcaDir = this.getOrcaDir(projectRoot)
    const memoryPath = this.getMemoryPath(projectRoot)

    if (!existsSync(orcaDir)) {
      await mkdir(orcaDir, { recursive: true })
    }

    if (!existsSync(memoryPath)) {
      await writeFile(memoryPath, INITIAL_MEMORY_TEMPLATE, 'utf-8')
    }

    return memoryPath
  }

  /**
   * Đọc toàn bộ nội dung Living Memory của dự án.
   */
  async loadMemoryContent(projectRoot: string): Promise<string> {
    const memoryPath = await this.ensureMemoryFile(projectRoot)
    try {
      const content = await readFile(memoryPath, 'utf-8')
      const maxChars = this.config.maxCharacters ?? DEFAULT_MAX_CHARS
      if (content.length > maxChars) {
        return `${content.slice(0, maxChars)}\n\n... [Nội dung Living Memory đã được rút gọn để tối ưu token] ...`
      }
      return content
    } catch {
      return ''
    }
  }

  /**
   * Thêm một ghi chú vào mục phù hợp trong MEMORY.md.
   */
  async appendNote(
    projectRoot: string,
    section: 'conventions' | 'decisions' | 'rules' | 'lessons',
    note: string
  ): Promise<void> {
    const memoryPath = await this.ensureMemoryFile(projectRoot)
    const timestamp = new Date().toISOString().split('T')[0]
    const formattedNote = `\n- [${timestamp}] ${note.trim()}`
    await appendFile(memoryPath, formattedNote, 'utf-8')
  }

  /**
   * Định dạng thành XML block chuẩn để inject trực tiếp vào system prompt của Agent.
   */
  async getPromptInjection(projectRoot: string): Promise<string> {
    const memory = await this.loadMemoryContent(projectRoot)
    if (!memory.trim()) {
      return ''
    }

    return `<project_memory>\n${memory.trim()}\n</project_memory>`
  }
}
