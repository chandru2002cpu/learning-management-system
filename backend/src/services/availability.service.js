import Availability from '../models/availability.model.js'
import Lesson, { BLOCKING_STATUSES } from '../models/lesson.model.js'
import TutorProfile from '../models/tutorProfile.model.js'
import User from '../models/user.model.js'
import {
  DAYS,
  addDays,
  isPastSlot,
  slotCovers,
  timesOverlap,
  toMinutes,
  todayString,
  weekdayFromDate,
} from '../utils/schedule.js'

export function formatAvailability(slot) {
  return {
    id: slot._id,
    tutor: slot.tutor,
    dayOfWeek: slot.dayOfWeek,
    startTime: slot.startTime,
    endTime: slot.endTime,
  }
}

export async function findBlockingLesson({ tutorId, date, startTime, endTime, ignoreLessonId }) {
  const start = toMinutes(startTime)
  const end = toMinutes(endTime)
  if (start === null || end === null) return null

  const query = {
    tutor: tutorId,
    date,
    status: { $in: BLOCKING_STATUSES },
  }

  if (ignoreLessonId) {
    query._id = { $ne: ignoreLessonId }
  }

  const lessons = await Lesson.find(query).select('startTime endTime')

  return (
    lessons.find((lesson) => {
      const lessonStart = toMinutes(lesson.startTime)
      const lessonEnd = toMinutes(lesson.endTime)
      if (lessonStart === null || lessonEnd === null) return false
      return timesOverlap(start, end, lessonStart, lessonEnd)
    }) || null
  )
}

export async function listTutorAvailability(tutorId) {
  const slots = await Availability.find({ tutor: tutorId }).sort({ dayOfWeek: 1, startTime: 1 })
  return slots.map(formatAvailability)
}

export async function createAvailability(tutorId, { dayOfWeek, startTime, endTime }) {
  const slot = await Availability.create({
    tutor: tutorId,
    dayOfWeek,
    startTime,
    endTime,
  })
  return formatAvailability(slot)
}

export async function updateAvailability(tutorId, slotId, updates) {
  const slot = await Availability.findOneAndUpdate(
    { _id: slotId, tutor: tutorId },
    updates,
    { new: true, runValidators: true },
  )
  return slot ? formatAvailability(slot) : null
}

export async function deleteAvailability(tutorId, slotId) {
  const slot = await Availability.findOneAndDelete({ _id: slotId, tutor: tutorId })
  return Boolean(slot)
}

export async function openSlotsForDate(tutorId, date, ignoreLessonId) {
  const dayOfWeek = weekdayFromDate(date)
  const slots = await Availability.find({ tutor: tutorId, dayOfWeek }).sort({ startTime: 1 })
  const open = []

  for (const slot of slots) {
    const conflict = await findBlockingLesson({
      tutorId,
      date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      ignoreLessonId,
    })

    if (!conflict) {
      const key = `${slot.startTime}-${slot.endTime}`
      if (!open.some((item) => `${item.startTime}-${item.endTime}` === key)) {
        open.push(formatAvailability(slot))
      }
    }
  }

  return open
}

export async function assertSlotIsBookable({ tutorId, date, startTime, endTime, ignoreLessonId }) {
  const start = toMinutes(startTime)
  const end = toMinutes(endTime)
  const dayOfWeek = weekdayFromDate(date)
  const slots = await Availability.find({ tutor: tutorId, dayOfWeek })

  const covered = slots.some((slot) =>
    slotCovers(toMinutes(slot.startTime), toMinutes(slot.endTime), start, end),
  )

  if (!covered) {
    const error = new Error('Selected time is not within tutor availability')
    error.status = 409
    throw error
  }

  const conflict = await findBlockingLesson({
    tutorId,
    date,
    startTime,
    endTime,
    ignoreLessonId,
  })

  if (conflict) {
    const error = new Error('This time is already booked')
    error.status = 409
    throw error
  }
}

export async function listUpcomingOpenSlots(dayCount = 14) {
  const tutors = await User.find({ role: 'tutor', isActive: true }).select('name')
  const profiles = await TutorProfile.find({
    user: { $in: tutors.map((tutor) => tutor._id) },
  }).select('user subjects hourlyRate')
  const profileByUser = new Map(profiles.map((profile) => [profile.user.toString(), profile]))
  const groups = []

  for (let offset = 0; offset < dayCount; offset += 1) {
    const date = addDays(todayString(), offset)
    const tutorSlots = []

    for (const tutor of tutors) {
      const slots = await openSlotsForDate(tutor._id, date)
      const futureSlots = slots.filter((slot) => !isPastSlot(date, slot.startTime))
      if (!futureSlots.length) continue

      const profile = profileByUser.get(tutor._id.toString())
      tutorSlots.push({
        id: tutor._id,
        name: tutor.name,
        subjects: profile?.subjects || [],
        hourlyRate: profile?.hourlyRate ?? 0,
        slots: futureSlots,
      })
    }

    if (tutorSlots.length) {
      groups.push({ date, tutors: tutorSlots })
    }
  }

  return groups
}

export function validateTimeRange(startTime, endTime) {
  const start = toMinutes(startTime)
  const end = toMinutes(endTime)
  if (start === null || end === null || start >= end) {
    return 'End time must be after start time'
  }
  return ''
}

export { DAYS }
