import { BrowserWindow, ipcMain, session } from 'electron'
import type {
  AIProvider,
  OAuthLoginRequest,
  OAuthLoginResult
} from '../../shared/account-profile-types'

const DEFAULT_AUTH_URLS: Record<AIProvider, string> = {
  gemini: 'https://accounts.google.com/signin/v2/identifier?service=lso&flowName=GlifWebSignIn',
  chatgpt: 'https://chatgpt.com/auth/login',
  claude: 'https://claude.ai/login',
  custom: 'https://accounts.google.com'
}

function getProviderLoginUrl(provider: AIProvider, explicitUrl?: string): string {
  if (explicitUrl && explicitUrl.trim().length > 0) {
    return explicitUrl
  }
  return DEFAULT_AUTH_URLS[provider] || 'https://accounts.google.com'
}

export function openMultiAccountOAuthWindow(
  request: OAuthLoginRequest
): Promise<OAuthLoginResult> {
  return new Promise((resolve) => {
    const accountId = request.accountId || `acc-${Date.now()}`
    const partitionId = `persist:oauth_${request.provider}_${accountId}`
    const loginUrl = getProviderLoginUrl(request.provider, request.initialUrl)

    const ses = session.fromPartition(partitionId)
    const win = new BrowserWindow({
      width: 620,
      height: 760,
      title: `Kevin Studio - Đăng nhập ${request.provider.toUpperCase()} (${request.accountName || accountId})`,
      webPreferences: {
        partition: partitionId,
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true
      }
    })

    win.removeMenu()

    let detectedEmail: string | null = null

    // Monitor headers or cookies to detect user info if possible
    win.webContents.on('did-navigate', async (_event, url) => {
      try {
        const cookies = await ses.cookies.get({})
        for (const cookie of cookies) {
          if (cookie.name === 'user_email' || cookie.name === 'account_email') {
            detectedEmail = cookie.value
          }
        }
        // If Google signin completed
        if (url.includes('myaccount.google.com') || url.includes('google.com/search')) {
          win.close()
        }
        // If ChatGPT completed
        if (url.startsWith('https://chatgpt.com/') && !url.includes('/auth/')) {
          win.close()
        }
        // If Claude completed
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
