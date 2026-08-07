import Link from '@/components/Link'
import type { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'

interface Props {
  posts: CoreContent<Blog>[]
}

export default function PostArchive({ posts }: Props) {
  if (!posts.length) {
    return <p className="text-gray-600 dark:text-gray-400">目前還沒有文章。</p>
  }

  return (
    <ol>
      {posts.map((post, index) => {
        const { path, date, title } = post
        const year = date.slice(0, 4)
        const startsYear = posts[index - 1]?.date.slice(0, 4) !== year

        return (
          <li key={path} className={startsYear ? 'mt-14 first:mt-0' : 'mt-4'}>
            {startsYear && (
              <h2 className="mb-5 text-xl font-semibold text-gray-950 dark:text-gray-100">
                {year}
              </h2>
            )}
            <article className="grid grid-cols-[3.5rem_1fr] items-baseline gap-3 sm:grid-cols-[4rem_1fr]">
              <time
                dateTime={date}
                className="font-mono text-sm text-gray-500 tabular-nums dark:text-gray-400"
              >
                {date.slice(5, 10).replace('-', '.')}
              </time>
              <h3 className="text-base leading-7 font-medium">
                <Link
                  href={`/${path}`}
                  className="hover:text-primary-600 hover:decoration-primary-500 dark:hover:text-primary-400 text-gray-900 underline decoration-gray-300 underline-offset-4 transition-colors dark:text-gray-100 dark:decoration-gray-700"
                >
                  {title}
                </Link>
              </h3>
            </article>
          </li>
        )
      })}
    </ol>
  )
}
