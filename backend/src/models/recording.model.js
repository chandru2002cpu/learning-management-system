import mongoose from 'mongoose'

const recordingSchema = new mongoose.Schema(
  {
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
      index: true,
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    videoUrl: {
      type: String,
      required: true,
      select: false,
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
      max: 86400,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

recordingSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.videoUrl
    return ret
  },
})

const Recording = mongoose.model('Recording', recordingSchema)

export default Recording
