import { Goal, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { translate } from '@/i18n/i18n'
import { useMemo } from 'react'
import type { CommentMarkdownLinkClickHandler } from '@/components/sidebar/CommentMarkdown'
import type { RuntimeFileOperationArgs } from '@/runtime/runtime-file-client-types'
import type { NativeChatMessage } from '../../../../shared/native-chat/native-chat-types'
import type { NativeChatDeliveryNotice } from './NativeChatMessageRow'
import { NativeChatRewindAction } from './NativeChatRewindAction'
import type { NativeChatRewindSurface } from './use-native-chat-rewind'
import { NativeChatMarkdown } from './NativeChatMarkdown'
import { NativeChatUserMessageFold } from './NativeChatUserMessageFold'
import { NativeChatCodeBlock } from './NativeChatCodeBlock'
import { NativeChatCopyButton } from './NativeChatCopyButton'
import { NativeChatMessageTimestamp } from './NativeChatMessageTimestamp'
import { NativeChatAgentMessageCard } from './NativeChatAgentMessageCard'
import {
  NativeChatDetailsDisclosure,
  NativeChatImageAttachments
} from './NativeChatTranscriptChrome'
import type { deriveNativeChatRowContent } from '../../../../shared/native-chat/transcript/native-chat-row-content'

function extractSlashCommands(text: string): string[] {
  if (!text) {
    return []
  }
  const matches = text.matchAll(/(?:^|\s)\/([a-zA-Z0-9_-]{2,})/g)
  const set = new Set<string>()
  for (const m of matches) {
    const name = m[1]
    if (name) {
      set.add(name)
    }
  }
  return Array.from(set)
}

const USER_META_REVEAL =
  'transition-opacity can-hover:pointer-events-none can-hover:opacity-0 group-hover:pointer-events-auto group-hover:opacity-100 [.group:has(:focus-visible)_&]:pointer-events-auto [.group:has(:focus-visible)_&]:opacity-100'

/** Sending replaces the timestamp without changing row height; image-only prompts offer no text copy. */
function UserMessageMeta({
  markdown,
  timestamp,
  sending,
  rewind
}: {
  markdown: string
  timestamp: number | null
  sending: boolean
  rewind?: { itemId: string; surface: NativeChatRewindSurface }
}): React.JSX.Element | null {
  if (!markdown && timestamp === null && !sending && !rewind) {
    return null
  }
  return (
    <div
      // Hover-only once sent, so find skips it; "Sending…" stays on screen and stays findable.
      data-native-chat-find-skip={sending ? undefined : true}
      className={cn('flex select-none items-center gap-1', !sending && USER_META_REVEAL)}
    >
      {markdown ? (
        <NativeChatCopyButton text={markdown} className={sending ? USER_META_REVEAL : undefined} />
      ) : null}
      {sending ? (
        <span className="text-xs whitespace-nowrap text-chat-foreground-faint">
          {translate('components.native-chat.messageSending', 'Sending…')}
        </span>
      ) : (
        <NativeChatMessageTimestamp timestamp={timestamp} focusable />
      )}
      {rewind && !sending ? (
        <NativeChatRewindAction itemId={rewind.itemId} rewind={rewind.surface} />
      ) : null}
    </div>
  )
}

export function NativeChatUserMessageRow({
  message,
  markdown,
  prose,
  rowRef,
  onRefolded,
  onLinkClick,
  allowFileUriLinks,
  runtimeContext,
  rewind,
  deliveryNotice
}: {
  message: NativeChatMessage
  markdown: string
  prose: ReturnType<typeof deriveNativeChatRowContent>['prose']
  rowRef: React.RefObject<HTMLDivElement | null>
  onRefolded: () => void
  onLinkClick?: CommentMarkdownLinkClickHandler
  allowFileUriLinks: boolean
  runtimeContext?: RuntimeFileOperationArgs | null
  rewind?: NativeChatRewindSurface
  deliveryNotice?: NativeChatDeliveryNotice
}): React.JSX.Element {
  // Agent-authored input belongs to the turn but uses a left-aligned sender row instead of the person’s bubble.
  const from = message.from
  const sending = deliveryNotice?.sending === true

  const detectedSkills = useMemo(() => {
    const list: string[] = []
    if (message.command?.name) {
      list.push(message.command.name)
    }
    if (message.skills && Array.isArray(message.skills)) {
      for (const s of message.skills) {
        if (s.name && !list.includes(s.name)) {
          list.push(s.name)
        }
      }
    }
    const fromText = extractSlashCommands(markdown)
    for (const name of fromText) {
      if (!list.includes(name)) {
        list.push(name)
      }
    }
    return list
  }, [message.command, message.skills, markdown])
  return (
    <div
      ref={rowRef}
      // Read by the context menu: only rows showing the hover copy or rewind offer them there.
      data-native-chat-message-id={markdown ? message.id : undefined}
      data-native-chat-rewind-item={rewind && !sending ? message.id : undefined}
      className={cn('group relative flex flex-col gap-0.5', from ? 'items-start' : 'items-end')}
    >
      {from ? (
        <NativeChatAgentMessageCard
          message={message}
          from={from}
          runtimeContext={runtimeContext}
          onLinkClick={onLinkClick}
          allowFileUriLinks={allowFileUriLinks}
          onRefolded={onRefolded}
        />
      ) : (
        <div className="max-w-[80%] rounded-xl border border-chat-user-border bg-chat-user-surface px-3.5 py-2.5 text-sm text-chat-foreground-strong">
          {markdown ? (
            <>
              <NativeChatImageAttachments
                blocks={prose}
                runtimeContext={runtimeContext}
                enablePreview={runtimeContext !== undefined}
              />
              <NativeChatUserMessageFold
                messageId={message.id}
                markdown={markdown}
                onRefolded={onRefolded}
              >
                <NativeChatMarkdown
                  rowKey={message.id}
                  content={markdown}
                  variant="document"
                  className="text-sm"
                  renderCodeBlock={NativeChatCodeBlock}
                  onLinkClick={onLinkClick}
                  allowFileUriLinks={allowFileUriLinks}
                />
              </NativeChatUserMessageFold>
            </>
          ) : (
            <NativeChatImageAttachments
              blocks={prose}
              runtimeContext={runtimeContext}
              enablePreview={runtimeContext !== undefined}
            />
          )}
        </div>
      )}
      {message.sentAs === 'goal' ? (
        <div className="flex items-center gap-1 text-xs text-chat-foreground-faint">
          <Goal className="size-3" aria-hidden />
          <span>{translate('components.native-chat.goal.sentAsGoal', 'Sent as goal')}</span>
        </div>
      ) : null}
      {detectedSkills.length > 0 ? (
        <div
          className="flex flex-wrap items-center gap-1.5"
          data-testid="native-chat-active-skills"
        >
          {detectedSkills.map((name) => (
            <div
              key={name}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-medium bg-primary/10 text-primary border border-primary/20 shadow-xs"
            >
              <Sparkles className="size-3 animate-pulse" aria-hidden />
              <span>Skill Active: {name}</span>
            </div>
          ))}
        </div>
      ) : null}
      {!from ? (
        <UserMessageMeta
          markdown={markdown}
          timestamp={message.timestamp}
          sending={sending}
          {...(rewind ? { rewind: { itemId: message.id, surface: rewind } } : {})}
        />
      ) : null}
      {deliveryNotice?.text !== undefined ? (
        <div className="flex max-w-[85%] items-center gap-2 text-2xs text-destructive/80">
          <span className="min-w-0 break-words">{deliveryNotice.text}</span>
          {deliveryNotice.onDismiss ? (
            <Button type="button" variant="ghost" size="xs" onClick={deliveryNotice.onDismiss}>
              {translate('components.native-chat.dismissDeliveryNotice', 'Dismiss')}
            </Button>
          ) : null}
        </div>
      ) : null}
      {deliveryNotice?.detail ? (
        <div className="max-w-[85%]">
          <NativeChatDetailsDisclosure
            summary={translate('components.native-chat.notices.details', 'Details')}
          >
            {deliveryNotice.detail}
          </NativeChatDetailsDisclosure>
        </div>
      ) : null}
    </div>
  )
}
