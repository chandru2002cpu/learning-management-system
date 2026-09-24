import multer from 'multer'
import { env } from '../config/env.js'
import { assertVideoFile } from '../services/storage.service.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.recordingMaxBytes },
  fileFilter(_req, file, callback) {
    try {
      assertVideoFile({ ...file, size: 1 })
      callback(null, true)
    } catch (error) {
      callback(error)
    }
  },
})

export const uploadRecording = upload.single('video')
