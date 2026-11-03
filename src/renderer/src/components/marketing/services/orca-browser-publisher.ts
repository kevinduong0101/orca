import { useAppStore } from '@/store'
import type { MarketingPost } from '../types/marketing-types'

export type BrowserPublishResult = {
  success: boolean
  notice: string
  url: string
}

export async function publishPostViaOrcaBrowser(
  post: MarketingPost,
  onSuccess?: () => void
): Promise<BrowserPublishResult> {
  const store = useAppStore.getState()
  const worktreeId = store.activeWorktreeId || Object.keys(store.worktrees || {})[0] || 'default'

  const url =
    post.channel === 'pinterest'
      ? 'https://www.pinterest.com/pin-builder/'
      : post.channel === 'linkedin'
        ? 'https://www.linkedin.com/feed/'
        : post.destinationUrl || 'https://kevinduong.com'

  const titlePrefix =
    post.channel === 'pinterest'
      ? 'Pinterest Pin Builder'
      : post.channel === 'linkedin'
        ? 'LinkedIn Feed'
        : 'Website Preview'

  try {
    // 1. Activate or create internal Orca browser tab
    store.createBrowserTab(worktreeId, url, {
      activate: true,
      title: `${titlePrefix} - Marketing`
    })
    store.setActiveTabType('browser', worktreeId)

    // 2. Prepare text payload and copy to clipboard for rapid pasting
    let clipboardText = ''
    if (post.channel === 'pinterest') {
      clipboardText = `${post.title}\n\n${post.content}\n\nLink: ${post.destinationUrl || 'https://kevinduong.com'}`
    } else if (post.channel === 'linkedin') {
      clipboardText = post.title ? `${post.title}\n\n${post.content}` : post.content
    } else {
      clipboardText = `# ${post.title}\n\n${post.content}`
    }

    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(clipboardText)
    }

    onSuccess?.()

    return {
      success: true,
      notice: `Đã mở tab nội bộ ${post.channel.toUpperCase()} trong Orca và sao chép nội dung vào Clipboard. AI sẵn sàng xuất bản.`,
      url
    }
  } catch (err) {
    console.error('Failed to open Orca browser tab:', err)
    return {
      success: false,
      notice: `Lỗi mở tab Orca: ${err instanceof Error ? err.message : String(err)}`,
      url
    }
  }
}
