import { ReactNode } from 'react'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog, Authors } from 'contentlayer/generated'
import { format, parseISO } from 'date-fns'
import Comments from '@/components/Comments'
import Link from '@/components/Link'
import PageTitle from '@/components/PageTitle'
import SectionContainer from '@/components/SectionContainer'
import Tag from '@/components/Tag'
import PostReaction from '@/components/PostReaction'
import siteMetadata from '@/data/siteMetadata'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'

const editUrl = (path) => `${siteMetadata.siteRepo}/blob/main/data/${path}`
const discussUrl = (path) =>
  `https://mobile.twitter.com/search?q=${encodeURIComponent(`${siteMetadata.siteUrl}/${path}`)}`

interface LayoutProps {
  content: CoreContent<Blog>
  authorDetails: CoreContent<Authors>[]
  next?: { path: string; title: string }
  prev?: { path: string; title: string }
  children: ReactNode
}

export default function PostLayout({ content, next, prev, children }: LayoutProps) {
  const { filePath, path, slug, date, title, tags, readingTime } = content
  const basePath = path.split('/')[0]

  return (
    <SectionContainer>
      <ScrollTopAndComment />
      <article>
        <div>
          <header className="border-b border-gray-200 pt-10 pb-8 dark:border-gray-700">
            <div className="space-y-2">
              <div>
                <PageTitle>{title}</PageTitle>
              </div>
              <div className="text-sm leading-6 text-gray-500 dark:text-gray-400">
                <time dateTime={date}>{format(parseISO(date), 'MMMM d, yyyy')}</time>
                <span className="ml-4">read {Math.max(1, Math.ceil(readingTime.minutes))} min</span>
              </div>
            </div>
          </header>
          <div className="pb-8">
            <div>
              {/* blog 文章本體 */}
              <div className="postContent">{children}</div>
              <PostReaction slug={slug} />
              <div className="py-6 text-sm text-gray-600 dark:text-gray-400">
                <Link href={discussUrl(path)} rel="nofollow">
                  Discuss on Twitter
                </Link>
                {` • `}
                <Link href={editUrl(filePath)}>View on GitHub</Link>
              </div>
              {siteMetadata.comments && (
                <div
                  className="pt-6 pb-6 text-center text-gray-700 dark:text-gray-300"
                  id="comment"
                >
                  <Comments slug={slug} />
                </div>
              )}
            </div>
            <footer className="border-t border-gray-200 pt-6 dark:border-gray-700">
              <div className="text-sm leading-6 font-medium">
                {tags && (
                  <div className="pb-8">
                    <h2 className="mb-2 text-sm text-gray-500 dark:text-gray-400">Tags</h2>
                    <div className="flex flex-wrap">
                      {tags.map((tag) => (
                        <Tag key={tag} text={tag} />
                      ))}
                    </div>
                  </div>
                )}
                {(next || prev) && (
                  <nav
                    className="grid gap-8 border-t border-gray-200 py-8 sm:grid-cols-2 dark:border-gray-700"
                    aria-label="文章導覽"
                  >
                    {prev && prev.path && prev.title && (
                      <div className="articleNavItem col-start-1">
                        <h2 className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                          Previous Article
                        </h2>
                        <div className="text-primary-600 hover:text-primary-800 dark:hover:text-primary-400 dark:text-gray-200">
                          <Link href={`/${prev.path}`}>{prev.title}</Link>
                        </div>
                      </div>
                    )}

                    {next && next.path && next.title && (
                      <div className="articleNavItem col-start-2 justify-self-end sm:text-right">
                        <h2 className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                          Next Article
                        </h2>
                        <div className="text-primary-600 hover:text-primary-800 dark:hover:text-primary-400 dark:text-gray-200">
                          <Link href={`/${next.path}`}>{next.title}</Link>
                        </div>
                      </div>
                    )}
                  </nav>
                )}
              </div>
              <div>
                <Link
                  href={`/${basePath}`}
                  className="text-primary-600 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
                  aria-label="Back to the blog"
                >
                  &larr; Back to the blog
                </Link>
              </div>
            </footer>
          </div>
        </div>
      </article>
    </SectionContainer>
  )
}
