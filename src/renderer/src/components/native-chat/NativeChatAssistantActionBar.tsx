import { useState, useMemo, type JSX } from 'react'
import { Copy, Check, ThumbsUp, ThumbsDown, RotateCcw, Bookmark, ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { translate } from '@/i18n/i18n'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useMessageFeedback } from './agent-feedback-store'
import { withoutNativeChatVisualDirectiveLines } from '../../../../shared/native-chat/native-chat-visual-directive'

export type NativeChatAssistantActionBarProps = {
  messageId: string
  markdown: string
  timestamp: number | null
  onScrollToTop?: () => void
  onRetry?: () => void
  className?: string
}

function formatTimestamp(ts: number | null): string {
  if (!ts) {
    return ''
  }
  const d = new Date(ts)
  const pad = (n: number) => n.toString().padStart(2, '0')
  const year = d.getFullYear()
  const month = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  const hours = pad(d.getHours())
  const mins = pad(d.getMinutes())
  return `${year}-${month}-${day} ${hours}:${mins}`
}

export function NativeChatAssistantActionBar({
  messageId,
  markdown,
  timestamp,
  onScrollToTop,
  onRetry,
  className
}: NativeChatAssistantActionBarProps): JSX.Element {
  const [copied, setCopied] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const { feedback, setRating, remove } = useMessageFeedback(messageId)

  const isLiked = feedback?.rating === 'like'
  const isDisliked = feedback?.rating === 'dislike'

  const formattedTime = useMemo(() => formatTimestamp(timestamp), [timestamp])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(withoutNativeChatVisualDirectiveLines(markdown))
      setCopied(true)
      toast.success(translate('components.native-chat.copied', 'Copied to clipboard'))
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy')
    }
  }

  const handleLike = () => {
    if (isLiked) {
      remove()
      toast.info('Đã bỏ thích câu trả lời')
    } else {
      setRating('like', undefined, markdown)
      toast.success('Đã thích! Agent sẽ ghi nhận để duy trì phong cách trả lời này.')
    }
  }

  const handleDislikeReason = (reason: string) => {
    setRating('dislike', reason, markdown)
    setPopoverOpen(false)
    toast.success(`Đã ghi nhận: "${reason}". Agent sẽ cải thiện ở các câu trả lời sau!`)
  }

  const handleBookmark = () => {
    setBookmarked(!bookmarked)
    toast.info(!bookmarked ? 'Đã ghim tin nhắn' : 'Đã bỏ ghim')
  }

  return (
    <div
      data-native-chat-find-skip
      className={cn(
        'mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-border/30 pt-2 text-xs text-muted-foreground select-none',
        className
      )}
    >
      <div className="flex items-center gap-1">
        {/* Copy Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleCopy}
              className="flex size-7 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-label="Copy message"
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-500" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={4}>
            {copied ? 'Đã chép' : 'Sao chép tin nhắn'}
          </TooltipContent>
        </Tooltip>

        {/* Thumbs Up (Like) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleLike}
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-md transition-all hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                isLiked &&
                  'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/20 hover:text-emerald-400'
              )}
              aria-label="Thích câu trả lời"
            >
              <ThumbsUp className={cn('size-3.5', isLiked && 'fill-current')} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={4}>
            {isLiked ? 'Đã thích (Click để hủy)' : 'Thích (Duy trì phong cách này)'}
          </TooltipContent>
        </Tooltip>

        {/* Thumbs Down (Dislike) with Popover */}
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-md transition-all hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                    isDisliked &&
                      'bg-rose-500/15 text-rose-500 hover:bg-rose-500/20 hover:text-rose-400'
                  )}
                  aria-label="Chưa hài lòng"
                >
                  <ThumbsDown className={cn('size-3.5', isDisliked && 'fill-current')} />
                </button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={4}>
              {isDisliked
                ? 'Chưa hài lòng (Click để sửa lý do)'
                : 'Chưa hài lòng (Góp ý để cải thiện)'}
            </TooltipContent>
          </Tooltip>

          <PopoverContent side="top" align="start" className="w-64 p-3 shadow-lg">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-foreground">Điều gì cần cải thiện?</span>
              <span className="text-2xs text-muted-foreground">
                Agent sẽ học từ phản hồi này để trả lời tốt hơn.
              </span>
              <div className="flex flex-col gap-1 pt-1">
                {[
                  'Chưa đúng ý / Không chính xác',
                  'Quá dài dòng, cần ngắn gọn',
                  'Lỗi code hoặc lệnh không chạy',
                  'Thiếu dẫn chứng hoặc file'
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => handleDislikeReason(reason)}
                    className="flex w-full items-center justify-start rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors text-left"
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Retry / Return command */}
        {onRetry ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onRetry}
                className="flex size-7 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                aria-label="Thử lại"
              >
                <RotateCcw className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={4}>
              Thử lại câu trả lời
            </TooltipContent>
          </Tooltip>
        ) : null}

        {/* Bookmark */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleBookmark}
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                bookmarked && 'text-primary'
              )}
              aria-label="Ghim tin nhắn"
            >
              <Bookmark className={cn('size-3.5', bookmarked && 'fill-current')} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={4}>
            {bookmarked ? 'Bỏ ghim' : 'Ghim tin nhắn'}
          </TooltipContent>
        </Tooltip>

        {/* Scroll To Top */}
        {onScrollToTop ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onScrollToTop}
                className="flex size-7 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                aria-label="Cuộn lên đầu tin nhắn"
              >
                <ArrowUp className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={4}>
              Cuộn lên đầu
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>

      {/* Timestamp */}
      {formattedTime ? (
        <span className="text-2xs font-mono text-muted-foreground/70" title={formattedTime}>
          {formattedTime}
        </span>
      ) : null}
    </div>
  )
}
