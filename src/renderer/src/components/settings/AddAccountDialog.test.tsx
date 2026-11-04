import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AddAccountDialog } from './AddAccountDialog'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

describe('AddAccountDialog', () => {
  it('renders the dialog with provider choices when open is true', () => {
    render(<AddAccountDialog open={true} onOpenChange={vi.fn()} initialProvider="gemini" />)

    expect(screen.getByText('Thêm tài khoản AI mới')).toBeDefined()
    expect(screen.getByText('Google Gemini')).toBeDefined()
    expect(screen.getByText('OpenAI ChatGPT')).toBeDefined()
    expect(screen.getByText('Anthropic Claude')).toBeDefined()
    expect(screen.getByText('Đăng nhập OAuth Web')).toBeDefined()
  })
})
