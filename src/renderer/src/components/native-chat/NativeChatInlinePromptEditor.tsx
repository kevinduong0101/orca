import { useState, useRef, useEffect, type JSX, type KeyboardEvent } from 'react'
import { Pencil, X, CornerDownLeft, ArrowDownToLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import { isImeOwnedKeyboardEvent } from '@/lib/ime-composition-keyboard-event'

export type NativeChatInlinePromptEditorProps = {
  initialText: string
  onCancel: () => void
  onSendToComposer: (text: string) => void
  onReturnCommand: (text: string) => void
}

export function putTextIntoComposer(text: string): boolean {
  const proseMirror = document.querySelector<HTMLElement>('.ProseMirror[contenteditable="true"]')
  if (proseMirror) {
    proseMirror.focus()
    const selection = window.getSelection()
    const range = document.createRange()
    range.selectNodeContents(proseMirror)
    selection?.removeAllRanges()
    selection?.addRange(range)
    document.execCommand('insertText', false, text)
    proseMirror.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    return true
  }
  const textarea = document.querySelector<HTMLTextAreaElement | HTMLInputElement>(
    'textarea[data-composer-input], [data-testid="native-chat-composer"] textarea'
  )
  if (textarea) {
    textarea.value = text
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
    textarea.focus()
    textarea.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    return true
  }
  return false
}

export function triggerComposerSend(): void {
  setTimeout(() => {
    const sendBtn = document.querySelector<HTMLButtonElement>(
      'button[aria-label="Send"], button[aria-label="Gửi"]'
    )
    if (sendBtn && !sendBtn.disabled) {
      sendBtn.click()
    } else {
      const proseMirror = document.querySelector<HTMLElement>(
        '.ProseMirror[contenteditable="true"]'
      )
      if (proseMirror) {
        proseMirror.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            bubbles: true,
            cancelable: true
          })
        )
      }
    }
  }, 60)
}

export function NativeChatInlinePromptEditor({
  initialText,
  onCancel,
  onSendToComposer,
  onReturnCommand
}: NativeChatInlinePromptEditorProps): JSX.Element {
  const [text, setText] = useState(initialText)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.selectionStart = textareaRef.current.value.length
      textareaRef.current.selectionEnd = textareaRef.current.value.length
    }
  }, [])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (isImeOwnedKeyboardEvent(e)) {
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      onReturnCommand(text)
    }
  }

  return (
    <div className="flex w-full min-w-[280px] max-w-[620px] flex-col gap-2 rounded-xl border border-primary/30 bg-chat-user-surface p-3 shadow-md">
      <div className="flex items-center justify-between border-b border-border/40 pb-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 font-medium text-foreground">
          <Pencil className="size-3.5 text-primary" aria-hidden />
          <span>{translate('components.native-chat.editMessage.title', 'Edit prompt')}</span>
        </div>
        <span className="text-2xs text-muted-foreground/70">
          Esc: {translate('common.cancel', 'Cancel')} • ⌘Enter:{' '}
          {translate('components.native-chat.editMessage.returnCommand', 'Return')}
        </span>
      </div>

      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={Math.min(10, Math.max(3, text.split('\n').length))}
        className="w-full resize-y rounded-lg border border-input bg-background/85 p-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        placeholder={translate(
          'components.native-chat.editMessage.placeholder',
          'Edit your message…'
        )}
      />

      <div className="flex flex-wrap items-center justify-end gap-1.5 pt-1">
        <Button type="button" variant="ghost" size="xs" onClick={onCancel}>
          <X className="mr-1 size-3" aria-hidden />
          {translate('common.cancel', 'Cancel')}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="xs"
          onClick={() => onSendToComposer(text)}
          title={translate('components.native-chat.editMessage.toComposer', 'Return to Composer')}
        >
          <ArrowDownToLine className="mr-1 size-3" aria-hidden />
          {translate('components.native-chat.editMessage.toComposer', 'Return to Composer')}
        </Button>
        <Button
          type="button"
          variant="default"
          size="xs"
          onClick={() => onReturnCommand(text)}
          title={translate('components.native-chat.editMessage.returnCommand', 'Return & Send')}
        >
          <CornerDownLeft className="mr-1 size-3" aria-hidden />
          {translate('components.native-chat.editMessage.returnCommand', 'Return lệnh (Send)')}
        </Button>
      </div>
    </div>
  )
}
