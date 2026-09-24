import crypto from 'crypto'
import Razorpay from 'razorpay'
import { env } from '../config/env.js'

export function isLiveGateway() {
  const keyId = env.razorpayKeyId
  const keySecret = env.razorpayKeySecret
  return Boolean(
    keyId &&
      keySecret &&
      keyId.startsWith('rzp_') &&
      !keyId.includes('placeholder') &&
      keySecret.length >= 16 &&
      !keySecret.includes('replace_with'),
  )
}

export function verifyGatewaySignature({ orderId, paymentId, signature }) {
  if (!env.razorpayKeySecret) {
    const error = new Error('Payment gateway is not configured')
    error.status = 503
    throw error
  }

  const expected = crypto
    .createHmac('sha256', env.razorpayKeySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')

  const actual = String(signature || '')
  const expectedBuffer = Buffer.from(expected)
  const actualBuffer = Buffer.from(actual)

  if (expectedBuffer.length !== actualBuffer.length) return false
  return crypto.timingSafeEqual(expectedBuffer, actualBuffer)
}

export async function createGatewayOrder({ amountPaise, currency, receipt }) {
  if (!isLiveGateway()) {
    return {
      id: `order_test_${crypto.randomBytes(8).toString('hex')}`,
      amount: amountPaise,
      currency,
    }
  }

  const client = new Razorpay({
    key_id: env.razorpayKeyId,
    key_secret: env.razorpayKeySecret,
  })

  return client.orders.create({
    amount: amountPaise,
    currency,
    receipt,
  })
}
