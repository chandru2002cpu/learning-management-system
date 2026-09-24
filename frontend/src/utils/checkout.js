import api from '../services/api.js'

function loadCheckoutScript() {
  if (window.Razorpay) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-razorpay-checkout]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Unable to load checkout')))
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.dataset.razorpayCheckout = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Unable to load checkout'))
    document.body.appendChild(script)
  })
}

export async function payForLesson(lessonId) {
  const { data } = await api.post('/payments/create-order', { lessonId })
  const order = data.data.order

  if (!order.liveCheckout) {
    const error = new Error('Add Razorpay test keys to open checkout. The server still verifies every payment.')
    error.order = order
    throw error
  }

  await loadCheckoutScript()

  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      key: order.keyId,
      amount: order.amountPaise,
      currency: order.currency,
      order_id: order.orderId,
      name: 'LMS',
      description: 'Lesson payment',
      handler: async (response) => {
        try {
          const verified = await api.post('/payments/verify', {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          })
          resolve(verified.data)
        } catch (err) {
          reject(err)
        }
      },
      modal: {
        ondismiss: () => {
          const error = new Error('Payment was not completed')
          error.dismissed = true
          reject(error)
        },
      },
    })

    checkout.on('payment.failed', (response) => {
      const error = new Error(response?.error?.description || 'Payment failed')
      reject(error)
    })
    checkout.open()
  })
}
