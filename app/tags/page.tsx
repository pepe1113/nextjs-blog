import Link from '@/components/Link'
import { slug } from 'github-slugger'
import tagData from 'app/tag-data.json'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({ title: 'Tags', description: 'Things I blog about' })

export default async function Page() {
  const tagCounts = tagData as Record<string, number>
  const tagKeys = Object.keys(tagCounts)
  const sortedTags = tagKeys.sort((a, b) => tagCounts[b] - tagCounts[a])
  return (
    <div>
      <header className="border-b border-gray-200 pt-10 pb-10 dark:border-gray-700">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-950 dark:text-gray-100">
          Tags
        </h1>
      </header>
      {!tagKeys.length && (
        <p className="pt-12 text-gray-600 dark:text-gray-400">目前還沒有標籤。</p>
      )}
      <ul className="grid gap-x-12 gap-y-5 pt-12 sm:grid-cols-2">
        {sortedTags.map((tag) => (
          <li key={tag}>
            <Link
              href={`/tags/${slug(tag)}`}
              className="group flex items-baseline justify-between gap-4 text-gray-900 dark:text-gray-100"
              aria-label={`View posts tagged ${tag}`}
            >
              <span className="group-hover:text-primary-600 group-hover:decoration-primary-500 dark:group-hover:text-primary-400 underline decoration-gray-300 underline-offset-4 transition-colors dark:decoration-gray-700">
                {tag}
              </span>
              <span className="font-mono text-sm text-gray-500 tabular-nums dark:text-gray-400">
                {tagCounts[tag]}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
