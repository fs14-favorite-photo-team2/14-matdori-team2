export default function ResponsiveLandingImage({
  desktop,
  tablet,
  mobile,
  alt,
  className,
  loading = 'lazy',
}) {
  return (
    <picture>
      <source
        media="(min-width: 1024px)"
        srcSet={desktop.src}
        width={desktop.width}
        height={desktop.height}
      />

      <source
        media="(min-width: 744px)"
        srcSet={tablet.src}
        width={tablet.width}
        height={tablet.height}
      />

      <img
        src={mobile.src}
        alt={alt}
        width={mobile.width}
        height={mobile.height}
        loading={loading}
        className={className}
      />
    </picture>
  )
}
