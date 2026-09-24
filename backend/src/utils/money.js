import { toMinutes } from './schedule.js'

export function calculateLessonAmount(lesson) {
  const start = toMinutes(lesson.startTime)
  const end = toMinutes(lesson.endTime)
  const hourlyRate = Number(lesson.price)

  if (start === null || end === null || end <= start || !Number.isFinite(hourlyRate) || hourlyRate < 0) {
    return null
  }

  const hours = (end - start) / 60
  return Math.round(hourlyRate * hours * 100) / 100
}

export function toSmallestUnit(amount) {
  return Math.round(Number(amount) * 100)
}
