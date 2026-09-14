const KST_OFFSET_MS = 9 * 60 * 60 * 1000

function toKstParts(now) {
  return new Date(now.getTime() + KST_OFFSET_MS)
}

export function getKstDayStart(now, offset = 0) {
  const kstNow = toKstParts(now)
  const kstDayStart = Date.UTC(
    kstNow.getUTCFullYear(),
    kstNow.getUTCMonth(),
    kstNow.getUTCDate() + offset,
  )

  return new Date(kstDayStart - KST_OFFSET_MS)
}

export function getKstMonthStart(now, offset = 0) {
  const kstNow = toKstParts(now)
  const kstMonthStart = Date.UTC(
    kstNow.getUTCFullYear(),
    kstNow.getUTCMonth() + offset,
    1,
  )

  return new Date(kstMonthStart - KST_OFFSET_MS)
}
