import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import { env } from '../config/env.js'

const uploadDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads/recordings')

const ALLOWED_TYPES = new Set(['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'])
const ALLOWED_EXTENSIONS = new Set(['.mp4', '.webm', '.ogg', '.mov'])

export function assertVideoFile(file) {
  if (!file) {
    const error = new Error('Video file is required')
    error.status = 400
    throw error
  }

  const extension = path.extname(file.originalname || '').toLowerCase()
  if (!ALLOWED_TYPES.has(file.mimetype) || !ALLOWED_EXTENSIONS.has(extension)) {
    const error = new Error('Only MP4, WebM, OGG, and MOV videos are allowed')
    error.status = 400
    throw error
  }

  if (!file.size || file.size > env.recordingMaxBytes) {
    const error = new Error('Video file is too large')
    error.status = 400
    throw error
  }
}

function isCloudinaryConfigured() {
  const { cloudName, apiKey, apiSecret } = env.cloudinary
  return Boolean(
    cloudName &&
      apiKey &&
      apiSecret &&
      !cloudName.includes('your_') &&
      !apiSecret.includes('replace') &&
      !cloudName.includes('placeholder'),
  )
}

async function cloudinaryClient() {
  const { v2 } = await import('cloudinary')
  v2.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  })
  return v2
}

export async function storeRecordingFile(file) {
  assertVideoFile(file)

  if (isCloudinaryConfigured()) {
    const cloudinary = await cloudinaryClient()
    const uploaded = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'lms/recordings',
          type: 'authenticated',
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        },
      )
      stream.end(file.buffer)
    })
    return `cloudinary:${uploaded.public_id}`
  }

  await fs.mkdir(uploadDir, { recursive: true })
  const filename = `recording-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${path.extname(file.originalname).toLowerCase()}`
  await fs.writeFile(path.join(uploadDir, filename), file.buffer)
  return `local:${filename}`
}

export async function removeRecordingFile(videoUrl) {
  if (!videoUrl) return

  if (videoUrl.startsWith('local:')) {
    const filename = videoUrl.slice('local:'.length)
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) return
    await fs.rm(path.join(uploadDir, filename), { force: true })
    return
  }

  if (videoUrl.startsWith('cloudinary:') && isCloudinaryConfigured()) {
    const cloudinary = await cloudinaryClient()
    await cloudinary.uploader.destroy(videoUrl.slice('cloudinary:'.length), {
      resource_type: 'video',
      type: 'authenticated',
    })
  }
}

export function localRecordingPath(videoUrl) {
  if (!videoUrl?.startsWith('local:')) return ''
  const filename = videoUrl.slice('local:'.length)
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) return ''
  return path.join(uploadDir, filename)
}

export async function cloudinaryPlaybackUrl(videoUrl) {
  if (!videoUrl?.startsWith('cloudinary:')) return ''
  const cloudinary = await cloudinaryClient()
  return cloudinary.url(videoUrl.slice('cloudinary:'.length), {
    resource_type: 'video',
    type: 'authenticated',
    sign_url: true,
    secure: true,
  })
}
