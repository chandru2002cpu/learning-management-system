import { Router } from 'express'
import { getPaymentHistory, postCreateOrder, postVerifyPayment } from '../controllers/payment.controller.js'
import { protect, requireRole } from '../middleware/auth.middleware.js'

const router = Router()

router.post('/create-order', protect, requireRole('student'), postCreateOrder)
router.post('/verify', protect, requireRole('student'), postVerifyPayment)
router.get('/history', protect, requireRole('student', 'tutor'), getPaymentHistory)

export default router
