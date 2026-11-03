/**
 * DOM Automation Scripts for Pinterest and LinkedIn inside Orca Internal Browser Webview
 */

export type PlatformAutomationPayload = {
  title: string
  content: string
  link?: string
  boardName?: string
  tags?: string[]
}

export function generatePinterestAutomationScript(payload: PlatformAutomationPayload): string {
  return `(() => {
    try {
      const titleEl = document.querySelector(
        '[data-test-id="pin-draft-title"] input, textarea[id*="pin-title"], input[placeholder*="title" i]'
      ) as HTMLInputElement | HTMLTextAreaElement | null
      if (titleEl) {
        titleEl.value = ${JSON.stringify(payload.title)}
        titleEl.dispatchEvent(new Event('input', { bubbles: true }))
        titleEl.dispatchEvent(new Event('change', { bubbles: true }))
      }

      const descEl = document.querySelector(
        '[data-test-id="pin-draft-description"] [contenteditable="true"], div[role="textbox"], textarea[placeholder*="description" i]'
      ) as HTMLElement | null
      if (descEl) {
        if (descEl.isContentEditable) {
          descEl.focus()
          descEl.innerText = ${JSON.stringify(payload.content)}
          descEl.dispatchEvent(new InputEvent('input', { bubbles: true }))
        } else if ('value' in descEl) {
          (descEl as HTMLTextAreaElement).value = ${JSON.stringify(payload.content)}
          descEl.dispatchEvent(new Event('input', { bubbles: true }))
        }
      }

      const linkEl = document.querySelector(
        '[data-test-id="pin-draft-link"] input, input[id*="pin-link"], input[placeholder*="link" i]'
      ) as HTMLInputElement | null
      if (linkEl && ${JSON.stringify(payload.link || '')}) {
        linkEl.value = ${JSON.stringify(payload.link || '')}
        linkEl.dispatchEvent(new Event('input', { bubbles: true }))
        linkEl.dispatchEvent(new Event('change', { bubbles: true }))
      }

      return { ok: true, message: 'Pinterest Pin Builder populated successfully' }
    } catch (e) {
      return { ok: false, error: String(e) }
    }
  })()`
}

export function generateLinkedInAutomationScript(payload: PlatformAutomationPayload): string {
  const fullPost = payload.title ? `${payload.title}\n\n${payload.content}` : payload.content
  return `(() => {
    try {
      const startPostBtn = document.querySelector(
        'button.share-box-feed-entry__trigger, button[aria-label*="Start a post" i]'
      ) as HTMLButtonElement | null
      if (startPostBtn) {
        startPostBtn.click()
      }
      setTimeout(() => {
        const editor = document.querySelector(
          '.editor-content [contenteditable="true"], div.ql-editor, div[role="textbox"]'
        ) as HTMLElement | null
        if (editor) {
          editor.focus()
          editor.innerText = ${JSON.stringify(fullPost)}
          editor.dispatchEvent(new InputEvent('input', { bubbles: true }))
        }
      }, 500)
      return { ok: true, message: 'LinkedIn post editor opened and populated' }
    } catch (e) {
      return { ok: false, error: String(e) }
    }
  })()`
}
