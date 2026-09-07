'use client'

import { Comments as CommentsComponent } from 'pliny/comments'
import { useTheme } from 'next-themes'
import siteMetadata from '@/data/siteMetadata'

export default function Comments({ slug }: { slug: string }) {
  const { resolvedTheme } = useTheme()

  if (!siteMetadata.comments?.provider) {
    return null
  }

  if (siteMetadata.comments.provider === 'giscus') {
    if (!resolvedTheme) return null

    const giscusTheme =
      resolvedTheme === 'dark'
        ? siteMetadata.comments.giscusConfig.darkTheme
        : siteMetadata.comments.giscusConfig.theme
    const commentsConfig = {
      ...siteMetadata.comments,
      giscusConfig: {
        ...siteMetadata.comments.giscusConfig,
        theme: giscusTheme,
        darkTheme: giscusTheme,
      },
    }

    return <CommentsComponent commentsConfig={commentsConfig} slug={slug} />
  }

  return <CommentsComponent commentsConfig={siteMetadata.comments} slug={slug} />
}
