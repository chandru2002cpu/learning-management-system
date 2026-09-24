import mongoose from 'mongoose'
import Payment from '../models/payment.model.js'
import Lesson from '../models/lesson.model.js'
import { env } from '../config/env.js'
import { calculateLessonAmount, toSmallestUnit } from '../utils/money.js'
import { createGatewayOrder, isLiveGateway, verifyGatewaySignature } from './razorpay.gateway.js'
import { buildMeetingLink } from './meeting.service.js'

function fail(message, status) {
  const error = new Error(message)
  error.status = status
  throw error
}

function formatPayment(payment) {
  const lesson = payment.lesson
  const student = payment.student
  const tutor = payment.tutor

  return {
    id: payment._id,
    lessonId: lesson?._id || lesson,
    lessonTitle: lesson?.title || '',
    studentName: student?.name || '',
    tutorName: tutor?.name || '',
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    orderId: payment.orderId,
    paymentId: payment.paymentId || '',
    createdAt: payment.createdAt,
  }
}

async function loadOwnedLesson(lessonId, studentId) {
  if (!mongoose.Types.ObjectId.isValid(lessonId)) fail('Invalid lesson id', 400)

  const lesson = await Lesson.findById(lessonId)
  if (!lesson) fail('Lesson not found', 404)
  if (lesson.student.toString() !== studentId.toString()) {
    fail('You can only pay for your own lesson', 403)
  }
  if (lesson.status === 'cancelled' || lesson.status === 'completed') {
    fail('This lesson cannot be paid', 400)
  }

  return lesson
}

export async function createPaymentOrder(student, lessonId) {
  const lesson = await loadOwnedLesson(lessonId, student._id)
  const paid = await Payment.findOne({ lesson: lesson._id, status: 'paid' })
  if (paid) fail('This lesson is already paid', 409)

  const amount = calculateLessonAmount(lesson)
  const amountPaise = toSmallestUnit(amount)
  if (amount === null || amountPaise < 100) {
    fail('Lesson amount must be at least 1.00', 400)
  }

  const currency = env.razorpayCurrency
  const order = await createGatewayOrder({
    amountPaise,
    currency,
    receipt: lesson._id.toString().slice(0, 40),
  })

  const payment = await Payment.create({
    student: lesson.student,
    tutor: lesson.tutor,
    lesson: lesson._id,
    amount,
    currency,
    status: 'created',
    orderId: order.id,
  })

  return {
    keyId: env.razorpayKeyId,
    orderId: payment.orderId,
    amount: payment.amount,
    amountPaise,
    currency: payment.currency,
    lessonId: lesson._id,
    liveCheckout: isLiveGateway(),
  }
}

export async function verifyPayment(student, { orderId, paymentId, signature }) {
  if (!orderId || !paymentId || !signature) fail('Payment verification fields are required', 400)

  const payment = await Payment.findOne({ orderId })
  if (!payment) fail('Payment order not found', 404)
  if (payment.student.toString() !== student._id.toString()) {
    fail('You can only verify your own payment', 403)
  }

  if (payment.status === 'paid') {
    if (payment.paymentId === paymentId) {
      const lesson = await Lesson.findById(payment.lesson)
      return { payment: formatPayment(payment), lessonStatus: lesson?.status || 'confirmed' }
    }
    fail('This order is already paid', 409)
  }

  const lesson = await Lesson.findById(payment.lesson)
  if (!lesson || lesson.status === 'cancelled' || lesson.status === 'completed') {
    payment.status = 'failed'
    await payment.save()
    fail('This lesson cannot be paid', 400)
  }

  const valid = verifyGatewaySignature({ orderId, paymentId, signature })
  if (!valid) {
    payment.status = 'failed'
    payment.paymentId = ''
    await payment.save()
    fail('Payment verification failed', 400)
  }

  const expected = calculateLessonAmount(lesson)
  if (expected === null || expected !== payment.amount) {
    payment.status = 'failed'
    await payment.save()
    fail('Payment amount does not match the lesson price', 400)
  }

  payment.status = 'paid'
  payment.paymentId = paymentId
  await payment.save()

  if (lesson.status === 'pending') {
    lesson.status = 'confirmed'
  }
  if (lesson.status === 'confirmed' && !lesson.meetingLink) {
    lesson.meetingLink = buildMeetingLink(lesson)
  }
  await lesson.save()

  return { payment: formatPayment(payment), lessonStatus: lesson.status }
}

export async function listPaymentHistory(user) {
  const filter = user.role === 'tutor' ? { tutor: user._id } : { student: user._id }
  const payments = await Payment.find(filter)
    .populate('lesson', 'title')
    .populate('student', 'name')
    .populate('tutor', 'name')
    .sort({ createdAt: -1 })

  const formatted = payments.map(formatPayment)
  const result = { payments: formatted }

  if (user.role === 'tutor') {
    result.totalEarnings = formatted
      .filter((item) => item.status === 'paid')
      .reduce((sum, item) => sum + item.amount, 0)
    result.totalEarnings = Math.round(result.totalEarnings * 100) / 100
  }

  return result
}
