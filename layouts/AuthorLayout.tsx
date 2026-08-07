import { ReactNode } from 'react'
import type { Authors } from 'contentlayer/generated'
import SocialIcon from '@/components/social-icons'
import Image from '@/components/Image'

interface Props {
  children: ReactNode
  content: Omit<Authors, '_id' | '_raw' | 'body'>
}

export default function AuthorLayout({ children, content }: Props) {
  const { name, avatar, occupation, company, email, twitter, bluesky, linkedin, github } = content

  return (
    <div>
      <header className="border-b border-gray-200 pt-10 pb-10 dark:border-gray-700">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-950 dark:text-gray-100">
          About
        </h1>
      </header>
      <div className="py-12">
        <div className="grid gap-6 sm:grid-cols-[7rem_1fr] sm:items-center">
          {avatar && (
            <Image
              src={avatar}
              alt={name}
              width={112}
              height={112}
              className="h-28 w-28 rounded-full grayscale"
            />
          )}
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-gray-950 dark:text-gray-100">
              {name}
            </h2>
            <div className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
              {occupation}
            </div>
            {company && (
              <div className="text-sm leading-6 text-gray-500 dark:text-gray-400">{company}</div>
            )}
            <div className="mt-5 flex space-x-3">
              <SocialIcon kind="mail" href={`mailto:${email}`} />
              <SocialIcon kind="github" href={github} />
              <SocialIcon kind="linkedin" href={linkedin} />
              <SocialIcon kind="x" href={twitter} />
              <SocialIcon kind="bluesky" href={bluesky} />
            </div>
          </div>
        </div>
        <div className="prose dark:prose-invert mt-12 max-w-none border-t border-gray-200 pt-10 dark:border-gray-700">
          {children}
        </div>
      </div>
    </div>
  )
}
