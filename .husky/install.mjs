if (
  process.env.NODE_ENV !== 'production' &&
  !process.env.CI &&
  !process.env.VERCEL
) {
  const husky = (await import('husky')).default

  husky()
}
