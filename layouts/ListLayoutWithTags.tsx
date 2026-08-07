'use client'

import { usePathname } from 'next/navigation'
import { slug } from 'github-slugger'
import type { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Link from '@/components/Link'
import PostArchive from '@/components/PostArchive'
import tagData from 'app/tag-data.json'

interface PaginationProps {
  totalPages: number
  currentPage: number
}
interface ListLayoutProps {
  posts: CoreContent<Blog>[]
  title: string
  initialDisplayPosts?: CoreContent<Blog>[]
  pagination?: PaginationProps
}

function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname()
  const basePath = pathname
    .replace(/^\//, '') // Remove leading slash
    .replace(/\/page\/\d+\/?$/, '') // Remove any trailing /page
    .replace(/\/$/, '') // Remove trailing slash
  const prevPage = currentPage - 1 > 0
  const nextPage = currentPage + 1 <= totalPages

  return (
    <nav
      className="mt-14 grid grid-cols-3 border-t border-gray-200 py-8 text-sm dark:border-gray-700"
      aria-label="分頁"
    >
      <span>
        {prevPage && (
          <Link
            className="underline underline-offset-4"
            href={currentPage - 1 === 1 ? `/${basePath}/` : `/${basePath}/page/${currentPage - 1}`}
            rel="prev"
          >
            Previous
          </Link>
        )}
      </span>
      <span className="text-center text-gray-500 dark:text-gray-400">
        {currentPage} / {totalPages}
      </span>
      <span className="justify-self-end">
        {nextPage && (
          <Link
            className="underline underline-offset-4"
            href={`/${basePath}/page/${currentPage + 1}`}
            rel="next"
          >
            Next
          </Link>
        )}
      </span>
    </nav>
  )
}

export default function ListLayoutWithTags({
  posts,
  title,
  initialDisplayPosts = [],
  pagination,
}: ListLayoutProps) {
  const pathname = usePathname()
  const tagCounts = tagData as Record<string, number>
  const tagKeys = Object.keys(tagCounts)
  const sortedTags = tagKeys.sort((a, b) => tagCounts[b] - tagCounts[a])
  const activeTag = decodeURI(pathname.split('/tags/')[1]?.split('/')[0] ?? '')

  const displayPosts = initialDisplayPosts.length > 0 ? initialDisplayPosts : posts

  return (
    <div>
      <header className="border-b border-gray-200 pt-10 pb-10 dark:border-gray-700">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-950 dark:text-gray-100">
          {title}
        </h1>
        <nav aria-label="文章分類" className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link
            href="/blog"
            aria-current={pathname.startsWith('/blog') ? 'page' : undefined}
            className={
              pathname.startsWith('/blog')
                ? 'font-medium text-gray-950 dark:text-gray-100'
                : 'hover:text-primary-600 dark:hover:text-primary-400 text-gray-500 dark:text-gray-400'
            }
          >
            All Posts
          </Link>
          {sortedTags.map((tag) => {
            const active = activeTag === slug(tag)

            return (
              <Link
                key={tag}
                href={`/tags/${slug(tag)}`}
                aria-current={active ? 'page' : undefined}
                className={
                  active
                    ? 'font-medium text-gray-950 dark:text-gray-100'
                    : 'hover:text-primary-600 dark:hover:text-primary-400 text-gray-500 dark:text-gray-400'
                }
              >
                {tag} ({tagCounts[tag]})
              </Link>
            )
          })}
        </nav>
      </header>
      <div className="pt-12">
        <PostArchive posts={displayPosts} />
        {pagination && pagination.totalPages > 1 && (
          <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
        )}
      </div>
    </div>
  )
}
