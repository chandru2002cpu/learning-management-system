import { Router } from 'express'
import { getRoleDashboard } from '../controllers/dashboard.controller.js'
import { getStudentProfile, updateStudentProfile } from '../controllers/student.controller.js'
import { getStudentLessons, postLesson } from '../controllers/lesson.controller.js'
import { getUpcomingOpenSlots } from '../controllers/availability.controller.js'
import { protect, requireRole } from '../middleware/auth.middleware.js'
import { validateStudentProfile } from '../validators/profile.validator.js'

const router = Router()

router.get('/dashboard', protect, requireRole('student'), getRoleDashboard)
router.get('/open-slots', protect, requireRole('student'), getUpcomingOpenSlots)
router.get('/profile', protect, requireRole('student'), getStudentProfile)
router.put('/profile', protect, requireRole('student'), validateStudentProfile, updateStudentProfile)
router.get('/lessons', protect, requireRole('student'), getStudentLessons)
router.post('/lessons', protect, requireRole('student'), postLesson)

export default router
