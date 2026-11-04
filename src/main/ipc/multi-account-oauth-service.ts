import { BrowserWindow, ipcMain, session } from 'electron'
import type {
  AIProvider,
  OAuthLoginRequest,
  OAuthLoginResult
} from '../../shared/account-profile-types'

const ALLOWED_HOSTS: Record<AIProvider, readonly string[]> = {
  gemini: ['accounts.google.com', 'myaccount.google.com', 'google.com'],
  chatgpt: ['chatgpt.com', 'auth.openai.com', 'auth0.openai.com', 'openai.com'],
  claude: ['claude.ai', 'anthropic.com'],
  custom: ['accounts.google.com', 'openai.com', 'claude.ai']
}

const DEFAULT_AUTH_URLS: Record<AIProvider, string> = {
  gemini: 'https://accounts.google.com/signin/v2/identifier?service=lso&flowName=GlifWebSignIn',
  chatgpt: 'https://chatgpt.com/auth/login',
  claude: 'https://claude.ai/login',
  custom: 'https://accounts.google.com'
}

export function isAllowedProviderUrl(provider: AIProvider, targetUrl: string): boolean {
  try {
    const parsed = new URL(targetUrl)
    if (parsed.protocol !== 'https:') {
      return false
    }
    const allowed = ALLOWED_HOSTS[provider] || []
    return allowed.some((host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`))
  } catch {
    return false
  }
}

export function sanitizeAccountId(rawId?: string): string {
  if (!rawId) {
    return `acc-${Date.now()}`
  }
  return rawId.replace(/[^a-zA-Z0-9_-]/g, '')
}

export function openMultiAccountOAuthWindow(
  request: OAuthLoginRequest
): Promise<OAuthLoginResult> {
  return new Promise((resolve) => {
    const accountId = sanitizeAccountId(request.accountId)
    const partitionId = `persist:oauth_${request.provider}_${accountId}`
    const loginUrl =
      request.initialUrl && isAllowedProviderUrl(request.provider, request.initialUrl)
        ? request.initialUrl
        : DEFAULT_AUTH_URLS[request.provider]

    const ses = session.fromPartition(partitionId)
    const win = new BrowserWindow({
      width: 620,
      height: 760,
      title: `Kevin Studio - Đăng nhập an toàn ${request.provider.toUpperCase()} (${request.accountName || accountId})`,
      webPreferences: {
        partition: partitionId,
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        webSecurity: true,
        allowRunningInsecureContent: false
      }
    })

    win.removeMenu()

    let detectedEmail: string | null = null

    // Block navigations outside of official provider domains
    win.webContents.on('will-navigate', (event, url) => {
      if (!isAllowedProviderUrl(request.provider, url)) {
        event.preventDefault()
      }
    })

    win.webContents.setWindowOpenHandler(() => {
      return { action: 'deny' }
    })

    win.webContents.on('did-navigate', async (_event, url) => {
      try {
        const cookies = await ses.cookies.get({})
        for (const cookie of cookies) {
          if (cookie.name === 'user_email' || cookie.name === 'account_email') {
            detectedEmail = cookie.value
          }
        }
        if (url.includes('myaccount.google.com') || url.includes('google.com/search')) {
          win.close()
        }
        if (url.startsWith('https://chatgpt.com/') && !url.includes('/auth/')) {
          win.close()
        }
        if (url.startsWith('https://claude.ai/chats') || url === 'https://claude.ai/') {
          win.close()
        }
      } catch {
        // Ignore navigation inspection errors
      }
    })

    win.on('closed', () => {
      resolve({
        success: true,
        accountId,
        email: detectedEmail,
        accountName: request.accountName || `${request.provider} Account`
      })
    })

    win.loadURL(loginUrl).catch((err: unknown) => {
      resolve({
        success: false,
        accountId,
        error: err instanceof Error ? err.message : String(err)
      })
    })
  })
}

export async function clearAccountPartition(
  partitionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const ses = session.fromPartition(partitionId)
    await ses.clearStorageData()
    await ses.clearCache()
    return { success: true }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err)
    }
  }
}

export function registerMultiAccountOAuthHandlers(): void {
  ipcMain.handle(
    'account:open-oauth-login',
    async (_event, request: OAuthLoginRequest): Promise<OAuthLoginResult> => {
      return openMultiAccountOAuthWindow(request)
    }
  )

  ipcMain.handle(
    'account:clear-partition',
    async (_event, args: { partitionId: string }): Promise<{ success: boolean; error?: string }> => {
      return clearAccountPartition(args.partitionId)
    }
  )
}
