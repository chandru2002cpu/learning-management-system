import crypto from 'crypto'
import { env } from '../config/env.js'

function roomSlug(value) {
  return String(value || 'lesson')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'lesson'
}

export function buildMeetingLink(lesson) {
  const random = crypto.randomBytes(6).toString('hex')
  const base = env.jitsiBaseUrl.replace(/\/$/, '')
  return `${base}/lms-${roomSlug(lesson.subject)}-${lesson._id}-${random}`
}

export async function ensureMeetingLink(lesson) {
  if (lesson.meetingLink) return lesson.meetingLink
  lesson.meetingLink = buildMeetingLink(lesson)
  await lesson.save()
  return lesson.meetingLink
}
