import Link from 'next/link'
import { slug } from 'github-slugger'
interface Props {
  text: string
}

const Tag = ({ text }: Props) => {
  return (
    <Link
      href={`/tags/${slug(text)}`}
      className="text-primary-500 hover:text-primary-600 dark:text-primary-500 dark:hover:text-primary-400 mr-3 text-sm font-bold uppercase"
    >
      {text.split(' ').join('-')}
    </Link>
  )
}

export default Tag
