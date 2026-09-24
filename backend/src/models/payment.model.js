import mongoose from 'mongoose'

const PAYMENT_STATUSES = ['created', 'paid', 'failed']

const paymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: 'created',
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    paymentId: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true },
)

const Payment = mongoose.model('Payment', paymentSchema)

export default Payment
export { PAYMENT_STATUSES }
