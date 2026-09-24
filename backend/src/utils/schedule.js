import { DAYS } from '../models/availability.model.js'

export const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/
export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

export function normalizeTime(value) {
  const match = String(value ?? '').trim().match(/^(\d{1,2}):(\d{2})/)
  if (!match) return ''

  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return ''

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function toMinutes(value) {
  const match = TIME_REGEX.exec(normalizeTime(value))
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

export function weekdayFromDate(date) {
  const [year, month, day] = date.split('-').map(Number)
  const weekday = new Date(year, month - 1, day).getDay()
  return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][weekday]
}

export function addDays(dateString, amount) {
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + amount)
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0')
  const nextDay = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${nextMonth}-${nextDay}`
}

export function todayString() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function isValidDate(date) {
  if (!DATE_REGEX.test(date)) return false
  const [year, month, day] = date.split('-').map(Number)
  const parsed = new Date(year, month - 1, day)
  return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day
}

export function isPastSlot(date, startTime) {
  if (date < todayString()) return true
  if (date > todayString()) return false
  const now = new Date()
  const current = now.getHours() * 60 + now.getMinutes()
  return toMinutes(startTime) <= current
}

export function timesOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA
}

export function slotCovers(slotStart, slotEnd, start, end) {
  return start >= slotStart && end <= slotEnd && start < end
}

export { DAYS }
