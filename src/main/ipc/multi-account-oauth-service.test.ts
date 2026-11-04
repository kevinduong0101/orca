import { describe, expect, it } from 'vitest'
import { isAllowedProviderUrl, sanitizeAccountId } from './multi-account-oauth-service'

describe('multi-account-oauth-service security validation', () => {
  it('allows valid HTTPS Google domains for Gemini', () => {
    expect(isAllowedProviderUrl('gemini', 'https://accounts.google.com/signin')).toBe(true)
    expect(isAllowedProviderUrl('gemini', 'https://myaccount.google.com')).toBe(true)
  })

  it('rejects unauthorized or malicious domains for Gemini', () => {
    expect(isAllowedProviderUrl('gemini', 'http://accounts.google.com')).toBe(false)
    expect(isAllowedProviderUrl('gemini', 'https://evil-google.com')).toBe(false)
    expect(isAllowedProviderUrl('gemini', 'https://attacker.site?redirect=google.com')).toBe(false)
  })

  it('allows valid HTTPS OpenAI domains for ChatGPT', () => {
    expect(isAllowedProviderUrl('chatgpt', 'https://chatgpt.com/auth/login')).toBe(true)
    expect(isAllowedProviderUrl('chatgpt', 'https://auth.openai.com/oauth/authorize')).toBe(true)
  })

  it('rejects invalid or non-HTTPS domains for ChatGPT', () => {
    expect(isAllowedProviderUrl('chatgpt', 'http://chatgpt.com')).toBe(false)
    expect(isAllowedProviderUrl('chatgpt', 'https://fake-chatgpt.com')).toBe(false)
  })

  it('sanitizes account IDs to prevent path traversal or partition injection', () => {
    expect(sanitizeAccountId('acc-123_test')).toBe('acc-123_test')
    expect(sanitizeAccountId('../../etc/passwd')).toBe('etcpasswd')
    expect(sanitizeAccountId('acc; rm -rf /')).toBe('accrm-rf')
  })
})
