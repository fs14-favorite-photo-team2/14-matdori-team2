export default function formatPoints(points) {
  return `${Number(points ?? 0).toLocaleString('ko-KR')} P`
}
