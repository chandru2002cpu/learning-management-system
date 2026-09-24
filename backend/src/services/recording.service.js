import mongoose from 'mongoose'
import Recording from '../models/recording.model.js'
import Lesson from '../models/lesson.model.js'
import {
  cloudinaryPlaybackUrl,
  localRecordingPath,
  removeRecordingFile,
  storeRecordingFile,
} from './storage.service.js'

function fail(message, status) {
  const error = new Error(message)
  error.status = status
  throw error
}

function formatRecording(recording) {
  const lesson = recording.lesson
  return {
    id: recording._id,
    title: recording.title,
    duration: recording.duration,
    uploadedAt: recording.uploadedAt,
    isAvailable: recording.isAvailable,
    lesson: lesson?._id
      ? { id: lesson._id, title: lesson.title, status: lesson.status }
      : { id: lesson },
    tutorName: recording.tutor?.name || '',
    studentName: recording.student?.name || '',
  }
}

async function loadRecording(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null
  return Recording.findById(id)
    .select('+videoUrl')
    .populate('lesson', 'title status student tutor')
    .populate('tutor', 'name')
    .populate('student', 'name')
}

function isTutorOwner(recording, user) {
  const tutorId = recording.tutor?._id?.toString() || recording.tutor?.toString()
  return user.role === 'tutor' && tutorId === user._id.toString()
}

function isLessonStudent(recording, user) {
  const studentId = recording.student?._id?.toString() || recording.student?.toString()
  return user.role === 'student' && studentId === user._id.toString()
}

function studentCanWatch(recording, user) {
  return isLessonStudent(recording, user) && recording.isAvailable && recording.lesson?.status === 'completed'
}

export async function createRecording(tutor, file, body) {
  const lessonId = String(body.lessonId || '').trim()
  const title = String(body.title || '').trim()
  const duration = Number(body.duration)

  if (!mongoose.Types.ObjectId.isValid(lessonId)) fail('Invalid lesson id', 400)
  if (title.length < 2) fail('Title must be at least 2 characters', 400)
  if (!Number.isInteger(duration) || duration < 0 || duration > 86400) {
    fail('Duration must be a whole number of seconds', 400)
  }

  const lesson = await Lesson.findById(lessonId)
  if (!lesson) fail('Lesson not found', 404)
  if (lesson.tutor.toString() !== tutor._id.toString()) {
    fail('You can only upload recordings for your own lessons', 403)
  }
  if (lesson.status !== 'confirmed' && lesson.status !== 'completed') {
    fail('Recordings can be uploaded for confirmed lessons', 400)
  }

  const videoUrl = await storeRecordingFile(file)
  const recording = await Recording.create({
    lesson: lesson._id,
    tutor: lesson.tutor,
    student: lesson.student,
    title,
    videoUrl,
    duration,
    uploadedAt: new Date(),
    isAvailable: true,
  })

  lesson.status = 'completed'
  await lesson.save()

  return formatRecording(await loadRecording(recording._id))
}

export async function listRecordings(user) {
  if (user.role === 'tutor') {
    const recordings = await Recording.find({ tutor: user._id })
      .populate('lesson', 'title status')
      .populate('tutor', 'name')
      .populate('student', 'name')
      .sort({ uploadedAt: -1 })
    return recordings.map(formatRecording)
  }

  const lessons = await Lesson.find({ student: user._id, status: 'completed' }).select('_id')
  const recordings = await Recording.find({
    student: user._id,
    isAvailable: true,
    lesson: { $in: lessons.map((lesson) => lesson._id) },
  })
    .populate('lesson', 'title status')
    .populate('tutor', 'name')
    .populate('student', 'name')
    .sort({ uploadedAt: -1 })

  return recordings.map(formatRecording)
}

export async function getRecordingForUser(id, user) {
  const recording = await loadRecording(id)
  if (!recording) fail('Recording not found', 404)
  if (!isTutorOwner(recording, user) && !studentCanWatch(recording, user)) {
    fail('You are not allowed to access this recording', 403)
  }
  return formatRecording(recording)
}

export async function updateRecording(id, tutor, body) {
  const recording = await loadRecording(id)
  if (!recording) fail('Recording not found', 404)
  if (!isTutorOwner(recording, tutor)) {
    fail('You can only manage your own recordings', 403)
  }

  if (body.title !== undefined) {
    const title = String(body.title).trim()
    if (title.length < 2) fail('Title must be at least 2 characters', 400)
    recording.title = title
  }
  if (body.duration !== undefined) {
    const duration = Number(body.duration)
    if (!Number.isInteger(duration) || duration < 0 || duration > 86400) {
      fail('Duration must be a whole number of seconds', 400)
    }
    recording.duration = duration
  }
  if (body.isAvailable !== undefined) {
    recording.isAvailable = Boolean(body.isAvailable)
  }

  await recording.save()
  return formatRecording(await loadRecording(recording._id))
}

export async function deleteRecording(id, tutor) {
  const recording = await loadRecording(id)
  if (!recording) fail('Recording not found', 404)
  if (!isTutorOwner(recording, tutor)) {
    fail('You can only manage your own recordings', 403)
  }

  await removeRecordingFile(recording.videoUrl)
  await recording.deleteOne()
}

export async function openRecordingStream(id, user, res) {
  const recording = await loadRecording(id)
  if (!recording) fail('Recording not found', 404)
  if (!isTutorOwner(recording, user) && !studentCanWatch(recording, user)) {
    fail('You are not allowed to access this recording', 403)
  }

  const localPath = localRecordingPath(recording.videoUrl)
  if (localPath) {
    return res.sendFile(localPath)
  }

  const playbackUrl = await cloudinaryPlaybackUrl(recording.videoUrl)
  if (!playbackUrl) fail('Recording file is unavailable', 404)

  const response = await fetch(playbackUrl)
  if (!response.ok) fail('Recording file is unavailable', 404)
  res.setHeader('Content-Type', response.headers.get('content-type') || 'video/mp4')
  const bytes = Buffer.from(await response.arrayBuffer())
  return res.send(bytes)
}
