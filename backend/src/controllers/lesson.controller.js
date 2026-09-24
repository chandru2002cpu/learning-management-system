import { isValidDate, normalizeTime } from '../utils/schedule.js'
import { validateTimeRange } from '../services/availability.service.js'
import {
  cancelLesson,
  createLesson,
  getLessonForUser,
  getMeetingForUser,
  listLessonsForStudent,
  listLessonsForTutor,
  rescheduleLesson,
} from '../services/lesson.service.js'

function sendError(res, error, fallback) {
  const status = error.status || 500
  return res.status(status).json({
    success: false,
    message: status === 500 ? fallback : error.message,
  })
}

function validateBookingBody(body) {
  const errors = []
  const title = String(body.title || '').trim()
  const subject = String(body.subject || '').trim()
  const description = body.description === undefined ? '' : String(body.description)
  const date = String(body.date || '').trim()
  const startTime = normalizeTime(body.startTime)
  const endTime = normalizeTime(body.endTime)
  const tutorId = String(body.tutorId || '').trim()

  if (!tutorId) errors.push('Tutor is required')
  if (title.length < 2) errors.push('Title must be at least 2 characters')
  if (!subject) errors.push('Subject is required')
  if (description.length > 1000) errors.push('Description cannot exceed 1000 characters')
  if (!isValidDate(date)) errors.push('Date must use YYYY-MM-DD')
  if (!startTime || !endTime) {
    errors.push('Times must use HH:mm format')
  } else if (validateTimeRange(startTime, endTime)) {
    errors.push(validateTimeRange(startTime, endTime))
  }

  return { errors, tutorId, title, subject, description, date, startTime, endTime }
}

export async function postLesson(req, res) {
  const parsed = validateBookingBody(req.body ?? {})
  if (parsed.errors.length) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: parsed.errors,
    })
  }

  try {
    const lesson = await createLesson(req.user, parsed)
    return res.status(201).json({
      success: true,
      message: 'Lesson booked',
      data: { lesson },
    })
  } catch (error) {
    return sendError(res, error, 'Unable to book lesson')
  }
}

export async function getStudentLessons(req, res) {
  const lessons = await listLessonsForStudent(req.user._id)
  return res.status(200).json({
    success: true,
    message: 'Lessons retrieved',
    data: { lessons },
  })
}

export async function getTutorLessons(req, res) {
  const lessons = await listLessonsForTutor(req.user._id)
  return res.status(200).json({
    success: true,
    message: 'Lessons retrieved',
    data: { lessons },
  })
}

export async function getLesson(req, res) {
  try {
    const lesson = await getLessonForUser(req.params.id, req.user)
    return res.status(200).json({
      success: true,
      message: 'Lesson retrieved',
      data: { lesson },
    })
  } catch (error) {
    return sendError(res, error, 'Unable to load lesson')
  }
}

export async function getLessonMeeting(req, res) {
  try {
    const meeting = await getMeetingForUser(req.params.id, req.user)
    return res.status(200).json({
      success: true,
      message: 'Meeting retrieved',
      data: { meeting },
    })
  } catch (error) {
    return sendError(res, error, 'Unable to load meeting')
  }
}

export async function postCancelLesson(req, res) {
  try {
    const lesson = await cancelLesson(req.params.id, req.user)
    return res.status(200).json({
      success: true,
      message: 'Lesson cancelled',
      data: { lesson },
    })
  } catch (error) {
    return sendError(res, error, 'Unable to cancel lesson')
  }
}

export async function postRescheduleLesson(req, res) {
  const date = String(req.body?.date || '').trim()
  const startTime = normalizeTime(req.body?.startTime)
  const endTime = normalizeTime(req.body?.endTime)
  const errors = []

  if (!isValidDate(date)) errors.push('Date must use YYYY-MM-DD')
  if (!startTime || !endTime) {
    errors.push('Times must use HH:mm format')
  } else if (validateTimeRange(startTime, endTime)) {
    errors.push(validateTimeRange(startTime, endTime))
  }

  if (errors.length) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors })
  }

  try {
    const lesson = await rescheduleLesson(req.params.id, req.user, { date, startTime, endTime })
    return res.status(200).json({
      success: true,
      message: 'Lesson rescheduled',
      data: { lesson },
    })
  } catch (error) {
    return sendError(res, error, 'Unable to reschedule lesson')
  }
}
