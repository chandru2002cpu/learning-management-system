import { Router } from 'express'
import { getLesson, getLessonMeeting, postCancelLesson, postRescheduleLesson } from '../controllers/lesson.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/:id/meeting', protect, getLessonMeeting)
router.get('/:id', protect, getLesson)
router.post('/:id/cancel', protect, postCancelLesson)
router.post('/:id/reschedule', protect, postRescheduleLesson)

export default router
