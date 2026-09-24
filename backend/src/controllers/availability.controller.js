import mongoose from 'mongoose'
import {
  createAvailability,
  deleteAvailability,
  listTutorAvailability,
  listUpcomingOpenSlots,
  openSlotsForDate,
  updateAvailability,
  validateTimeRange,
} from '../services/availability.service.js'
import { DAYS } from '../models/availability.model.js'
import { isValidDate, normalizeTime } from '../utils/schedule.js'

function sendError(res, status, message) {
  return res.status(status).json({ success: false, message })
}

function readSlot(body) {
  const dayOfWeek = String(body.dayOfWeek || '').trim().toLowerCase()
  const startTime = normalizeTime(body.startTime)
  const endTime = normalizeTime(body.endTime)
  const errors = []

  if (!DAYS.includes(dayOfWeek)) {
    errors.push('Day must be monday through sunday')
  }
  if (!startTime || !endTime) {
    errors.push('Times must use HH:mm format')
  } else {
    const rangeError = validateTimeRange(startTime, endTime)
    if (rangeError) errors.push(rangeError)
  }

  return { dayOfWeek, startTime, endTime, errors }
}

export async function getMyAvailability(req, res) {
  const availability = await listTutorAvailability(req.user._id)
  return res.status(200).json({
    success: true,
    message: 'Availability retrieved',
    data: { availability },
  })
}

export async function postAvailability(req, res) {
  const { dayOfWeek, startTime, endTime, errors } = readSlot(req.body ?? {})
  if (errors.length) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors })
  }

  const slot = await createAvailability(req.user._id, { dayOfWeek, startTime, endTime })
  return res.status(201).json({
    success: true,
    message: 'Availability created',
    data: { availability: slot },
  })
}

export async function putAvailability(req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return sendError(res, 400, 'Invalid availability id')
  }

  const { dayOfWeek, startTime, endTime, errors } = readSlot(req.body ?? {})
  if (errors.length) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors })
  }

  const slot = await updateAvailability(req.user._id, req.params.id, { dayOfWeek, startTime, endTime })
  if (!slot) return sendError(res, 404, 'Availability not found')

  return res.status(200).json({
    success: true,
    message: 'Availability updated',
    data: { availability: slot },
  })
}

export async function removeAvailability(req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return sendError(res, 400, 'Invalid availability id')
  }

  const deleted = await deleteAvailability(req.user._id, req.params.id)
  if (!deleted) return sendError(res, 404, 'Availability not found')

  return res.status(200).json({
    success: true,
    message: 'Availability deleted',
  })
}

export async function getUpcomingOpenSlots(_req, res) {
  const days = await listUpcomingOpenSlots(14)
  return res.status(200).json({
    success: true,
    message: days.length ? 'Open slots retrieved' : 'No open slots',
    data: { days },
  })
}

export async function getTutorAvailability(req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return sendError(res, 400, 'Invalid tutor id')
  }

  const { date } = req.query
  if (date) {
    if (!isValidDate(date)) return sendError(res, 400, 'Date must use YYYY-MM-DD')
    const slots = await openSlotsForDate(req.params.id, date)
    return res.status(200).json({
      success: true,
      message: 'Open slots retrieved',
      data: { date, slots },
    })
  }

  const availability = await listTutorAvailability(req.params.id)
  return res.status(200).json({
    success: true,
    message: 'Availability retrieved',
    data: { availability },
  })
}
