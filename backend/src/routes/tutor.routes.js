import { Router } from 'express'
import { getRoleDashboard } from '../controllers/dashboard.controller.js'
import { getTutorProfile, updateTutorProfile } from '../controllers/tutor.controller.js'
import {
  getMyAvailability,
  postAvailability,
  putAvailability,
  removeAvailability,
} from '../controllers/availability.controller.js'
import { getTutorLessons } from '../controllers/lesson.controller.js'
import { protect, requireRole } from '../middleware/auth.middleware.js'
import { validateTutorProfile } from '../validators/profile.validator.js'

const router = Router()

router.get('/dashboard', protect, requireRole('tutor'), getRoleDashboard)
router.get('/profile', protect, requireRole('tutor'), getTutorProfile)
router.put('/profile', protect, requireRole('tutor'), validateTutorProfile, updateTutorProfile)
router.get('/availability', protect, requireRole('tutor'), getMyAvailability)
router.post('/availability', protect, requireRole('tutor'), postAvailability)
router.put('/availability/:id', protect, requireRole('tutor'), putAvailability)
router.delete('/availability/:id', protect, requireRole('tutor'), removeAvailability)
router.get('/lessons', protect, requireRole('tutor'), getTutorLessons)

export default router
