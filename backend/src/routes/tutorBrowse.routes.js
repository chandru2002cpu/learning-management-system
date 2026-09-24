import { Router } from 'express'
import {
  getTutor,
  listTutors,
  validateTutorQuery,
} from '../controllers/tutorBrowse.controller.js'
import { getTutorAvailability } from '../controllers/availability.controller.js'
import { protect, requireRole } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/', protect, requireRole('student'), validateTutorQuery, listTutors)
router.get('/:id/availability', protect, getTutorAvailability)
router.get('/:id', protect, requireRole('student'), getTutor)

export default router