const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY
const MONTH = 30 * DAY
const YEAR = 12 * MONTH

export default function formatRelativeTime(createdAt) {
  const createdTime = new Date(createdAt).getTime()

  if (Number.isNaN(createdTime)) {
    return ''
  }

  const diff = Math.max(0, Date.now() - createdTime)

  if (diff < MINUTE) {
    return '방금 전'
  }

  if (diff < HOUR) {
    return `${Math.floor(diff / MINUTE)}분 전`
  }

  if (diff < DAY) {
    return `${Math.floor(diff / HOUR)}시간 전`
  }

  if (diff < WEEK) {
    return `${Math.floor(diff / DAY)}일 전`
  }

  if (diff < 4 * WEEK) {
    return `${Math.floor(diff / WEEK)}주 전`
  }

  if (diff < YEAR) {
    return `${Math.max(1, Math.floor(diff / MONTH))}개월 전`
  }

  return `${Math.floor(diff / YEAR)}년 전`
}
