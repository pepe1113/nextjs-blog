import type { SVGProps } from 'react'
import clsx from 'clsx'
import { Github, Instagram, Youtube } from './social-icons/icons'

const platforms = {
  github: { Icon: Github, baseUrl: 'https://github.com/' },
  instagram: { Icon: Instagram, baseUrl: 'https://www.instagram.com/' },
  youtube: { Icon: Youtube, baseUrl: 'https://www.youtube.com/@' },
}

type Platform = keyof typeof platforms
type Props =
  | { kind: Platform; account: string; href?: never; classname?: string }
  | { kind: 'other'; account: string; href: string; classname?: string }

function LinkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

export default function SocialAccountLink(props: Props) {
  const account = props.account.replace(/^@/, '')
  const platform = props.kind === 'other' ? null : platforms[props.kind]
  const href = platform ? `${platform.baseUrl}${account}` : props.href
  const Icon = platform?.Icon ?? LinkIcon

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${props.kind}: ${account}`}
      className={clsx(
        'border-primary-400 text-primary-500! hover:bg-primary-500 hover:text-white!',
        'dark:border-primary-400 dark:text-primary-300! dark:hover:bg-primary-300 dark:bg-gray-800 dark:hover:text-gray-700!',
        'mx-1 inline-flex items-center gap-1 space-x-0!',
        'rounded-full border border-gray-300 bg-gray-50 px-2.5! py-1!',
        'align-baseline text-[0.875em] leading-none font-medium text-gray-700!',
        'no-underline! transition hover:-translate-y-px',
        props.classname && props.classname
      )}
    >
      <Icon aria-hidden="true" className="h-[1em] w-[1em] shrink-0 fill-current" />
      {account}
    </a>
  )
}
