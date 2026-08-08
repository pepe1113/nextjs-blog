'use client'

import { FormEvent, useEffect, useState } from 'react'

type GuestbookEntry = {
  id: string
  parent_id: string | null
  author_name: string
  content: string
  created_at: string
}

type GuestbookEntryItemProps = {
  entry: GuestbookEntry
  replies: Map<string, GuestbookEntry[]>
  onReply: (entry: GuestbookEntry) => void
}

const dateFormatter = new Intl.DateTimeFormat('zh-TW', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function GuestbookEntryItem({ entry, replies, onReply }: GuestbookEntryItemProps) {
  const children = replies.get(entry.id) ?? []

  return (
    <li id={entry.id} className="border-l border-gray-200 pl-4 dark:border-gray-700">
      <article>
        <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <strong className="text-sm text-gray-900 dark:text-gray-100">{entry.author_name}</strong>
          <time className="text-xs text-gray-500" dateTime={entry.created_at}>
            {dateFormatter.format(new Date(entry.created_at))}
          </time>
        </header>
        <p className="mt-2 text-sm leading-6 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
          {entry.content}
        </p>
        <button
          type="button"
          className="mt-2 text-xs font-medium text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
          onClick={() => onReply(entry)}
        >
          回覆
        </button>
      </article>
      {children.length > 0 ? (
        <ul className="mt-5 space-y-5">
          {children.map((reply) => (
            <GuestbookEntryItem key={reply.id} entry={reply} replies={replies} onReply={onReply} />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export default function Guestbook() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([])
  const [replyToId, setReplyToId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/guestbook/', { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { entries?: GuestbookEntry[] }) => setEntries(data.entries ?? []))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setMessage('留言載入失敗，請稍後再試。')
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [])

  const entryIds = new Set(entries.map((entry) => entry.id))
  const replies = new Map<string, GuestbookEntry[]>()
  const rootEntries: GuestbookEntry[] = []

  for (const entry of entries) {
    if (!entry.parent_id || !entryIds.has(entry.parent_id)) {
      rootEntries.push(entry)
      continue
    }

    const siblings = replies.get(entry.parent_id) ?? []
    siblings.push(entry)
    replies.set(entry.parent_id, siblings)
  }

  const replyTo = replyToId ? entries.find((entry) => entry.id === replyToId) : undefined

  async function submitEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      const response = await fetch('/api/guestbook/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: replyToId,
          name: formData.get('name'),
          ...(formData.get('email') && { email: formData.get('email') }),
          content: formData.get('content'),
          website: formData.get('website'),
        }),
      })
      const data = (await response.json().catch(() => ({}))) as {
        entry?: GuestbookEntry
        error?: string
        notificationSent?: boolean
      }

      if (!response.ok || !data.entry) {
        throw new Error(data.error || '留言送出失敗，請稍後再試。')
      }

      setEntries((current) => [...current, data.entry as GuestbookEntry])
      form.reset()
      setReplyToId(null)
      setMessage(
        data.notificationSent === false ? '留言已送出，但通知信寄送失敗。' : '留言已送出。'
      )
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '留言送出失敗，請稍後再試。')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section aria-label="留言板">
      {isLoading ? <p className="text-sm text-gray-500">Loading…</p> : null}
      {!isLoading && entries.length === 0 ? (
        <p className="text-sm text-gray-500">你是第一則留言！</p>
      ) : null}
      {rootEntries.length > 0 ? (
        <ul className="space-y-6">
          {rootEntries.map((entry) => (
            <GuestbookEntryItem
              key={entry.id}
              entry={entry}
              replies={replies}
              onReply={(target) => setReplyToId(target.id)}
            />
          ))}
        </ul>
      ) : null}

      <form
        className="mt-10 space-y-4 border-t border-gray-200 pt-8 dark:border-gray-700"
        onSubmit={submitEntry}
      >
        {replyTo ? (
          <div className="flex items-center justify-between rounded-md bg-gray-100 px-3 py-2 text-sm dark:bg-gray-800">
            <span>Reply {replyTo.author_name}</span>
            <button
              type="button"
              className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
              onClick={() => setReplyToId(null)}
            >
              Cancel
            </button>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <label
              htmlFor="guestbook-name"
              className="text-sm leading-none font-medium text-gray-900 dark:text-gray-100"
            >
              Name
            </label>
            <input
              id="guestbook-name"
              className="h-9 w-full rounded-lg border border-gray-200 bg-transparent px-3 py-1 text-sm text-gray-900 shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-gray-400 focus-visible:ring-3 focus-visible:ring-gray-200/50 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-100 dark:focus-visible:border-gray-600 dark:focus-visible:ring-gray-800/50"
              name="name"
              autoComplete="name"
              maxLength={80}
              required
            />
          </div>
          <div className="grid gap-2">
            <label
              htmlFor="guestbook-email"
              className="text-sm leading-none font-medium text-gray-900 dark:text-gray-100"
            >
              Email（Optional）
            </label>
            <input
              id="guestbook-email"
              className="h-9 w-full rounded-lg border border-gray-200 bg-transparent px-3 py-1 text-sm text-gray-900 shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-gray-400 focus-visible:ring-3 focus-visible:ring-gray-200/50 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-100 dark:focus-visible:border-gray-600 dark:focus-visible:ring-gray-800/50"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="guestbook-content"
            className="text-sm leading-none font-medium text-gray-900 dark:text-gray-100"
          >
            Message
          </label>
          <textarea
            id="guestbook-content"
            className="min-h-32 w-full resize-y rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm text-gray-900 shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-gray-400 focus-visible:ring-3 focus-visible:ring-gray-200/50 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-100 dark:focus-visible:border-gray-600 dark:focus-visible:ring-gray-800/50"
            name="content"
            maxLength={2000}
            required
          />
        </div>

        <label className="absolute -left-[9999px]" aria-hidden="true">
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="hover:bg-primary-600 dark:hover:bg-primary-300 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting…' : replyTo ? 'Submit Reply' : 'Submit Message'}
          </button>
          <p className="text-sm text-gray-500" aria-live="polite">
            {message}
          </p>
        </div>
      </form>
    </section>
  )
}
