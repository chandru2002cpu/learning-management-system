import { Router } from 'express'
import { getMe, login, register } from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import { validateLogin, validateRegister } from '../validators/auth.validator.js'

const router = Router()

router.post('/register', validateRegister, register)
router.post('/login', validateLogin, login)
router.get('/me', protect, getMe)

export default router
