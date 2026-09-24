import { Router } from 'express'
import {
  getRecording,
  getRecordings,
  patchRecording,
  postRecording,
  removeRecording,
  streamRecording,
} from '../controllers/recording.controller.js'
import { uploadRecording } from '../middleware/upload.middleware.js'
import { protect, requireRole } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/', protect, requireRole('student', 'tutor'), getRecordings)
router.post('/', protect, requireRole('tutor'), uploadRecording, postRecording)
router.get('/:id/stream', protect, requireRole('student', 'tutor'), streamRecording)
router.get('/:id', protect, requireRole('student', 'tutor'), getRecording)
router.patch('/:id', protect, requireRole('tutor'), patchRecording)
router.delete('/:id', protect, requireRole('tutor'), removeRecording)

export default router
