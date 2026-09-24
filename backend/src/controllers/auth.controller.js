import bcrypt from 'bcrypt'
import User from '../models/user.model.js'
import { generateToken } from '../utils/jwt.js'

function sendError(res, status, message, errors) {
  const payload = {
    success: false,
    message,
  }

  if (errors) {
    payload.errors = errors
  }

  return res.status(status).json(payload)
}

export async function register(req, res) {
  try {
    const { name, email, password, role } = req.body

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
    })

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
      },
    })
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 409, 'Email is already registered')
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((item) => item.message)
      return sendError(res, 400, 'Validation failed', errors)
    }

    return sendError(res, 500, 'Unable to register user')
  }
}

export async function login(req, res) {
  try {
    const email = String(req.body.email).trim().toLowerCase()
    const { password } = req.body

    const user = await User.findOne({ email }).select('+password')

    if (!user) {
      return sendError(res, 401, 'Invalid email or password')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password')
    }

    if (!user.isActive) {
      return sendError(res, 403, 'Account is inactive')
    }

    const token = generateToken({
      id: user._id.toString(),
      role: user.role,
    })

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: user.toJSON(),
      },
    })
  } catch {
    return sendError(res, 500, 'Unable to login')
  }
}

export function getMe(req, res) {
  return res.status(200).json({
    success: true,
    message: 'Authenticated user retrieved',
    data: {
      user: req.user.toJSON(),
    },
  })
}
