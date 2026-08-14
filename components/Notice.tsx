import type { ReactNode } from 'react'

const icons = {
  note: '📝',
  tip: '💡',
  info: 'ℹ️',
  warning: '⚠️',
  danger: '🚨',
} as const

type NoticeType = keyof typeof icons

export default function Notice({
  children,
  title,
  type = 'note',
}: {
  children: ReactNode
  title?: string
  type?: NoticeType
}) {
  return (
    <aside className={`notice notice-${type}`} aria-label={title || type}>
      <div className="noticeTitle">{title || icons[type]}</div>
      <div className="noticeBody">{children}</div>
    </aside>
  )
}
