'use client'

import { useEffect, useRef, useState } from 'react'

const MAX_LOCAL_CLAPS = 10
const FLUSH_DELAY_MS = 400

type Props = {
  slug: string
}

export default function PostReaction({ slug }: Props) {
  const [clapCount, setClapCount] = useState(0)
  const [localClaps, setLocalClaps] = useState(0)
  const [burstCount, setBurstCount] = useState(0)
  const [burstKey, setBurstKey] = useState(0)
  const [error, setError] = useState('')
  const pendingDelta = useRef(0)
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const storageKey = `post-reaction:${slug}`

  useEffect(() => {
    const savedClaps = Number(localStorage.getItem(storageKey) ?? 0)
    setLocalClaps(Number.isFinite(savedClaps) ? Math.min(savedClaps, MAX_LOCAL_CLAPS) : 0)

    fetch(`/api/reactions/?slug=${encodeURIComponent(slug)}`)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { clapCount?: number }) => setClapCount(data.clapCount ?? 0))
      .catch(() => setError('拍手數載入失敗'))
  }, [slug, storageKey])

  useEffect(() => {
    return () => {
      if (flushTimer.current) {
        clearTimeout(flushTimer.current)
      }
    }
  }, [])

  function scheduleFlush() {
    if (flushTimer.current) {
      clearTimeout(flushTimer.current)
    }

    flushTimer.current = setTimeout(async () => {
      const delta = pendingDelta.current
      if (delta === 0) return

      pendingDelta.current = 0

      try {
        const response = await fetch('/api/reactions/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, delta }),
        })

        if (!response.ok) throw new Error('Failed to save reaction')

        const data = (await response.json()) as { clapCount?: number }
        if (typeof data.clapCount === 'number') {
          setClapCount(data.clapCount)
        }
      } catch {
        setError('拍手失敗，請再試一次')
        setClapCount((count) => Math.max(0, count - delta))
        setLocalClaps((count) => {
          const nextCount = Math.max(0, count - delta)
          localStorage.setItem(storageKey, String(nextCount))
          return nextCount
        })
      }
    }, FLUSH_DELAY_MS)
  }

  function clap() {
    if (localClaps >= MAX_LOCAL_CLAPS) return

    const nextLocalClaps = localClaps + 1
    localStorage.setItem(storageKey, String(nextLocalClaps))
    setLocalClaps(nextLocalClaps)
    setClapCount((count) => count + 1)
    setBurstCount(nextLocalClaps)
    setBurstKey((key) => key + 1)
    setError('')
    pendingDelta.current += 1
    scheduleFlush()
  }

  const isMaxed = localClaps >= MAX_LOCAL_CLAPS

  return (
    <div className="postReaction">
      <button
        type="button"
        className="postReactionButton"
        onClick={clap}
        disabled={isMaxed}
        aria-label={isMaxed ? '已拍滿 10 次' : '為這篇文章拍手'}
      >
        <span aria-hidden="true">👏</span>
        <span>{isMaxed ? '已拍滿' : clapCount}</span>
        {isMaxed && <span>{clapCount}</span>}
      </button>
      {burstCount > 0 && (
        <span key={burstKey} className="postReactionBurst" aria-hidden="true">
          +{burstCount}
        </span>
      )}
      {error && <p className="postReactionMessage">{error}</p>}
    </div>
  )
}
