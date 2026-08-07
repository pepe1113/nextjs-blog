'use client'

import { ReactNode, useEffect, useRef } from 'react'

export default function PostToc({ children }: { children: ReactNode }) {
  const tocRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const links = Array.from(
      tocRef.current?.querySelectorAll<HTMLAnchorElement>('a[href^="#"]') ?? []
    )
    const items = links
      .map((link) => ({
        link,
        heading: document.getElementById(decodeURIComponent(link.hash.slice(1))),
      }))
      .filter((item): item is { link: HTMLAnchorElement; heading: HTMLElement } => !!item.heading)

    if (!items.length) return

    const updateActiveLink = () => {
      const offset = window.innerHeight * 0.25
      let activeItem = items[0]

      for (const item of items) {
        if (item.heading.getBoundingClientRect().top > offset) break
        activeItem = item
      }

      for (const item of items) {
        const isActive = item === activeItem
        item.link.toggleAttribute('data-active', isActive)
        if (isActive) item.link.setAttribute('aria-current', 'location')
        else item.link.removeAttribute('aria-current')
      }
    }

    const observer = new IntersectionObserver(updateActiveLink, {
      rootMargin: '0px 0px -75% 0px',
    })

    items.forEach(({ heading }) => observer.observe(heading))
    updateActiveLink()

    return () => observer.disconnect()
  }, [])

  return (
    <nav ref={tocRef} className="postToc" aria-label="目錄">
      <h2 className="postTocTitle">目錄</h2>
      {children}
    </nav>
  )
}
