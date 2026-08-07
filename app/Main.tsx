import PostArchive from '@/components/PostArchive'
import siteMetadata from '@/data/siteMetadata'
import type { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import NewsletterForm from 'pliny/ui/NewsletterForm'

export default function Home({ posts }: { posts: CoreContent<Blog>[] }) {
  return (
    <>
      <div>
        <header className="pt-10 pb-16 sm:pt-16 sm:pb-20">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-950 dark:text-gray-100">
            Welcome
          </h2>
          <p className="mt-3 max-w-xl text-base leading-7 text-gray-600 dark:text-gray-400">
            {siteMetadata.description}
          </p>
        </header>
        <PostArchive posts={posts} />
      </div>
      {siteMetadata.newsletter?.provider && (
        <div className="mt-16 border-t border-gray-200 pt-8 dark:border-gray-700">
          <NewsletterForm />
        </div>
      )}
    </>
  )
}
