import { ipcRenderer } from 'electron'
import type { OAuthLoginRequest, OAuthLoginResult } from '../../shared/account-profile-types'

export type MultiAccountOAuthApi = {
  openOAuthLogin: (request: OAuthLoginRequest) => Promise<OAuthLoginResult>
  clearPartition: (args: { partitionId: string }) => Promise<{ success: boolean; error?: string }>
}

export const multiAccountOAuthApi: MultiAccountOAuthApi = {
  openOAuthLogin: (request: OAuthLoginRequest): Promise<OAuthLoginResult> => {
    return ipcRenderer.invoke('account:open-oauth-login', request)
  },
  clearPartition: (args: { partitionId: string }): Promise<{ success: boolean; error?: string }> => {
    return ipcRenderer.invoke('account:clear-partition', args)
  }
}
