import { createPaymentOrder, listPaymentHistory, verifyPayment } from '../services/payment.service.js'

function sendError(res, error, fallback) {
  const status = error.status || 500
  return res.status(status).json({
    success: false,
    message: status === 500 ? fallback : error.message,
  })
}

export async function postCreateOrder(req, res) {
  try {
    const order = await createPaymentOrder(req.user, req.body?.lessonId)
    return res.status(201).json({
      success: true,
      message: 'Payment order created',
      data: { order },
    })
  } catch (error) {
    return sendError(res, error, 'Unable to create payment order')
  }
}

export async function postVerifyPayment(req, res) {
  try {
    const result = await verifyPayment(req.user, {
      orderId: req.body?.orderId || req.body?.razorpay_order_id,
      paymentId: req.body?.paymentId || req.body?.razorpay_payment_id,
      signature: req.body?.signature || req.body?.razorpay_signature,
    })
    return res.status(200).json({
      success: true,
      message: 'Payment verified',
      data: result,
    })
  } catch (error) {
    return sendError(res, error, 'Unable to verify payment')
  }
}

export async function getPaymentHistory(req, res) {
  try {
    const history = await listPaymentHistory(req.user)
    return res.status(200).json({
      success: true,
      message: 'Payment history retrieved',
      data: history,
    })
  } catch (error) {
    return sendError(res, error, 'Unable to load payment history')
  }
}
