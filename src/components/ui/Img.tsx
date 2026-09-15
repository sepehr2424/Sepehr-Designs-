import { useState, type ImgHTMLAttributes } from 'react'
import clsx from 'clsx'

interface ImgProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
}

/** Image with a graceful gradient fallback if the source fails to load. */
export function Img({ src, alt, className, ...props }: ImgProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={clsx(
          'bg-gradient-to-br from-navy via-navy-light to-emerald',
          className
        )}
      />
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
      {...props}
    />
  )
}
