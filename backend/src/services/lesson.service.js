import mongoose from 'mongoose'
import Lesson, { BLOCKING_STATUSES } from '../models/lesson.model.js'
import Payment from '../models/payment.model.js'
import TutorProfile from '../models/tutorProfile.model.js'
import User from '../models/user.model.js'
import { assertSlotIsBookable } from './availability.service.js'
import { isPastSlot, isValidDate, normalizeTime, toMinutes } from '../utils/schedule.js'
import { calculateLessonAmount } from '../utils/money.js'
import { ensureMeetingLink } from './meeting.service.js'

function formatLesson(lesson) {
  const student = lesson.student
  const tutor = lesson.tutor

  return {
    id: lesson._id,
    student: student?._id ? { id: student._id, name: student.name } : student,
    tutor: tutor?._id ? { id: tutor._id, name: tutor.name } : tutor,
    subject: lesson.subject,
    title: lesson.title,
    description: lesson.description,
    date: lesson.date,
    startTime: lesson.startTime,
    endTime: lesson.endTime,
    status: lesson.status,
    price: lesson.price,
    amount: calculateLessonAmount(lesson),
  }
}

const userSelect = 'name role isActive'

async function loadLesson(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null
  return Lesson.findById(id).populate('student', userSelect).populate('tutor', userSelect)
}

function canAccess(lesson, user) {
  const studentId = lesson.student?._id?.toString() || lesson.student?.toString()
  const tutorId = lesson.tutor?._id?.toString() || lesson.tutor?.toString()
  const userId = user._id.toString()
  return studentId === userId || tutorId === userId
}

export async function createLesson(student, body) {
  const { tutorId, subject, title, description, date } = body
  const startTime = normalizeTime(body.startTime)
  const endTime = normalizeTime(body.endTime)

  if (!mongoose.Types.ObjectId.isValid(tutorId)) {
    const error = new Error('Invalid tutor id')
    error.status = 400
    throw error
  }

  if (tutorId === student._id.toString()) {
    const error = new Error('You cannot book yourself')
    error.status = 403
    throw error
  }

  const tutor = await User.findOne({ _id: tutorId, role: 'tutor', isActive: true })
  if (!tutor) {
    const error = new Error('Tutor not found')
    error.status = 404
    throw error
  }

  if (!isValidDate(date) || isPastSlot(date, startTime)) {
    const error = new Error('Choose a future date and time')
    error.status = 400
    throw error
  }

  const profile = await TutorProfile.findOne({ user: tutorId })
  if (!profile?.subjects?.length || !profile.subjects.some((item) => item.toLowerCase() === subject.trim().toLowerCase())) {
    const error = new Error('Subject is not offered by this tutor')
    error.status = 400
    throw error
  }

  await assertSlotIsBookable({ tutorId, date, startTime, endTime })

  const lesson = await Lesson.create({
    student: student._id,
    tutor: tutorId,
    subject: subject.trim(),
    title: title.trim(),
    description: description?.trim() || '',
    date,
    startTime,
    endTime,
    status: 'pending',
    meetingLink: '',
    price: profile.hourlyRate,
  })

  const conflict = await Lesson.find({
    tutor: tutorId,
    date,
    status: { $in: BLOCKING_STATUSES },
  }).select('startTime endTime')

  const overlapCount = conflict.filter((item) => {
    const lessonStart = toMinutes(item.startTime)
    const lessonEnd = toMinutes(item.endTime)
    return lessonStart !== null && lessonEnd !== null && lessonStart < toMinutes(endTime) && toMinutes(startTime) < lessonEnd
  }).length

  if (overlapCount > 1) {
    await Lesson.findByIdAndDelete(lesson._id)
    const error = new Error('This time is already booked')
    error.status = 409
    throw error
  }

  return formatLesson(await loadLesson(lesson._id))
}

export async function listLessonsForStudent(studentId) {
  const lessons = await Lesson.find({ student: studentId })
    .populate('student', userSelect)
    .populate('tutor', userSelect)
    .sort({ date: 1, startTime: 1 })
  return lessons.map(formatLesson)
}

export async function listLessonsForTutor(tutorId) {
  const lessons = await Lesson.find({ tutor: tutorId })
    .populate('student', userSelect)
    .populate('tutor', userSelect)
    .sort({ date: 1, startTime: 1 })
  return lessons.map(formatLesson)
}

export async function getLessonForUser(lessonId, user) {
  const lesson = await loadLesson(lessonId)
  if (!lesson) {
    const error = new Error('Lesson not found')
    error.status = 404
    throw error
  }
  if (!canAccess(lesson, user)) {
    const error = new Error('You are not allowed to access this lesson')
    error.status = 403
    throw error
  }
  const formatted = formatLesson(lesson)
  const paid = await Payment.exists({ lesson: lesson._id, status: 'paid' })
  return { ...formatted, paid: Boolean(paid) }
}

export async function getMeetingForUser(lessonId, user) {
  const lesson = await loadLesson(lessonId)
  if (!lesson) {
    const error = new Error('Lesson not found')
    error.status = 404
    throw error
  }
  if (!canAccess(lesson, user)) {
    const error = new Error('You are not allowed to access this meeting')
    error.status = 403
    throw error
  }
  if (lesson.status !== 'confirmed') {
    const error = new Error('Meeting is available for confirmed lessons only')
    error.status = 403
    throw error
  }

  const meetingLink = await ensureMeetingLink(lesson)
  return {
    meetingLink,
    provider: 'jitsi',
  }
}

export async function cancelLesson(lessonId, user) {
  const lesson = await loadLesson(lessonId)
  if (!lesson) {
    const error = new Error('Lesson not found')
    error.status = 404
    throw error
  }
  if (!canAccess(lesson, user)) {
    const error = new Error('You are not allowed to cancel this lesson')
    error.status = 403
    throw error
  }
  if (lesson.status === 'cancelled' || lesson.status === 'completed') {
    const error = new Error('This lesson cannot be cancelled')
    error.status = 400
    throw error
  }

  lesson.status = 'cancelled'
  await lesson.save()
  return formatLesson(lesson)
}

export async function rescheduleLesson(lessonId, user, { date, startTime, endTime }) {
  const lesson = await loadLesson(lessonId)
  if (!lesson) {
    const error = new Error('Lesson not found')
    error.status = 404
    throw error
  }
  if (!canAccess(lesson, user)) {
    const error = new Error('You are not allowed to reschedule this lesson')
    error.status = 403
    throw error
  }
  if (lesson.status === 'cancelled' || lesson.status === 'completed') {
    const error = new Error('This lesson cannot be rescheduled')
    error.status = 400
    throw error
  }
  if (!isValidDate(date) || isPastSlot(date, startTime)) {
    const error = new Error('Choose a future date and time')
    error.status = 400
    throw error
  }

  const tutorId = lesson.tutor._id.toString()
  await assertSlotIsBookable({
    tutorId,
    date,
    startTime,
    endTime,
    ignoreLessonId: lesson._id,
  })

  lesson.date = date
  lesson.startTime = startTime
  lesson.endTime = endTime
  lesson.status = 'rescheduled'
  await lesson.save()
  return formatLesson(lesson)
}
