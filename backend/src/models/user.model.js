import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const ROLES = ['student', 'tutor', 'admin']

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [254, 'Email cannot exceed 254 characters'],
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ROLES,
        message: 'Role must be student, tutor, or admin',
      },
      default: 'student',
    },
    avatar: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
      maxlength: [20, 'Phone number cannot exceed 20 characters'],
    },
    bio: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    preferences: {
      timezone: {
        type: String,
        trim: true,
        default: '',
        maxlength: [80, 'Timezone cannot exceed 80 characters'],
      },
      language: {
        type: String,
        trim: true,
        default: '',
        maxlength: [40, 'Language cannot exceed 40 characters'],
      },
      learningGoal: {
        type: String,
        trim: true,
        default: '',
        maxlength: [300, 'Learning goal cannot exceed 300 characters'],
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password
        delete ret.__v
        return ret
      },
    },
    toObject: {
      transform(_doc, ret) {
        delete ret.password
        delete ret.__v
        return ret
      },
    },
  },
)

userSchema.pre('validate', function normalizeEmail(next) {
  if (typeof this.email === 'string') {
    this.email = this.email.trim().toLowerCase()
  }
  next()
})

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    next()
    return
  }

  this.password = await bcrypt.hash(this.password, 10)
  next()
})

const User = mongoose.model('User', userSchema)

export default User
export { ROLES }
