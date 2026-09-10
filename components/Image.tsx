import NextImage, { ImageProps } from 'next/image'

const basePath = process.env.BASE_PATH

const Image = ({ src, ...rest }: ImageProps) => {
  if (
    (src && String(src).startsWith('https://img.peiwang.dev')) ||
    String(src).startsWith('https://images.unsplash.com')
  ) {
    return <NextImage src={src} {...rest} unoptimized />
  }
  return <NextImage src={`${basePath || ''}${src}`} {...rest} />
}

export default Image
