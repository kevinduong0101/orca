import { useMemo } from 'react'
import type { NativeChatSession } from './native-chat-live-session-contract'
import type { NativeChatLaunchPrompt } from '@/lib/native-chat-launch-prompt'
import type { NativeChatCommandMarker } from './native-chat-command-marker'
import {
  applyCommandMarkerBoundaries,
  commandMarkersAsMessages
} from './native-chat-command-marker'
import { launchPromptAsMessage } from './native-chat-pending'
import {
  pendingSendsAsMessages,
  type NativeChatPendingSend
} from '../../../../shared/native-chat-pending-sends'
import {
  deriveNativeChatStreamingText,
  nativeChatStreamingMessage
} from '../../../../shared/native-chat/native-chat-streaming'
import { selectNativeChatViewState, type NativeChatViewState } from './native-chat-view-state'

export type UseNativeChatResolvedTranscriptMessagesResult = {
  launchPromptMessage: ReturnType<typeof launchPromptAsMessage>
  sessionAfterCommandBoundaries: NativeChatSession
  sessionWithPending: NativeChatSession
  viewState: NativeChatViewState
}

export function useNativeChatResolvedTranscriptMessages(args: {
  session: NativeChatSession
  paneLaunchPrompt: NativeChatLaunchPrompt | null
  commandMarkers: readonly NativeChatCommandMarker[]
  pending: readonly NativeChatPendingSend[]
  hookPreview: string | undefined
  liveWorking: boolean
  hookPreviewIsToolOutput: boolean
}): UseNativeChatResolvedTranscriptMessagesResult {
  const {
    session,
    paneLaunchPrompt,
    commandMarkers,
    pending,
    hookPreview,
    liveWorking,
    hookPreviewIsToolOutput
  } = args

  const launchPromptMessage = useMemo(
    () => launchPromptAsMessage(paneLaunchPrompt, session.messages),
    [paneLaunchPrompt, session.messages]
  )
  const sessionWithLaunchPrompt = useMemo<NativeChatSession>(() => {
    if (!launchPromptMessage) {
      return session
    }
    return { ...session, messages: [...session.messages, launchPromptMessage] }
  }, [launchPromptMessage, session])

  const sessionAfterCommandBoundaries = useMemo<NativeChatSession>(() => {
    const messages = applyCommandMarkerBoundaries(sessionWithLaunchPrompt.messages, commandMarkers)
    return messages === sessionWithLaunchPrompt.messages
      ? sessionWithLaunchPrompt
      : { ...sessionWithLaunchPrompt, messages }
  }, [sessionWithLaunchPrompt, commandMarkers])

  // Match mobile ordering: hook preview before optimistic user echoes.
  const pendingMessages = useMemo(
    () => pendingSendsAsMessages(pending, sessionAfterCommandBoundaries.messages),
    [pending, sessionAfterCommandBoundaries.messages]
  )
  const streamingText = useMemo(() => {
    return deriveNativeChatStreamingText({
      messages:
        pendingMessages.length > 0
          ? [...sessionAfterCommandBoundaries.messages, ...pendingMessages]
          : sessionAfterCommandBoundaries.messages,
      previewText: hookPreview,
      working: liveWorking,
      previewIsToolOutput: hookPreviewIsToolOutput
    })
  }, [
    sessionAfterCommandBoundaries.messages,
    pendingMessages,
    hookPreview,
    liveWorking,
    hookPreviewIsToolOutput
  ])
  const sessionWithPending = useMemo<NativeChatSession>(() => {
    if (pending.length === 0 && commandMarkers.length === 0 && !streamingText) {
      return sessionAfterCommandBoundaries
    }
    return {
      ...sessionAfterCommandBoundaries,
      messages: [
        ...sessionAfterCommandBoundaries.messages,
        ...commandMarkersAsMessages(commandMarkers),
        ...(streamingText ? [nativeChatStreamingMessage(streamingText)] : []),
        ...pendingMessages
      ]
    }
  }, [sessionAfterCommandBoundaries, pending, pendingMessages, commandMarkers, streamingText])

  const viewState = selectNativeChatViewState(sessionWithPending)

  return {
    launchPromptMessage,
    sessionAfterCommandBoundaries,
    sessionWithPending,
    viewState
  }
}
