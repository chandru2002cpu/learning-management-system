import User from '../models/user.model.js'

function sendError(res, status, message) {
  return res.status(status).json({
    success: false,
    message,
  })
}

export function getStudentProfile(req, res) {
  return res.status(200).json({
    success: true,
    message: 'Student profile retrieved',
    data: {
      profile: req.user.toJSON(),
    },
  })
}

export async function updateStudentProfile(req, res) {
  try {
    const updates = {}
    const { name, avatar, phone, bio, preferences } = req.body

    if (name !== undefined) updates.name = name.trim()
    if (avatar !== undefined) updates.avatar = avatar.trim()
    if (phone !== undefined) updates.phone = phone.trim()
    if (bio !== undefined) updates.bio = bio.trim()

    if (preferences) {
      updates.preferences = {
        timezone: (preferences.timezone ?? req.user.preferences?.timezone ?? '').trim(),
        language: (preferences.language ?? req.user.preferences?.language ?? '').trim(),
        learningGoal: (preferences.learningGoal ?? req.user.preferences?.learningGoal ?? '').trim(),
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    })

    return res.status(200).json({
      success: true,
      message: 'Student profile updated',
      data: {
        profile: user.toJSON(),
      },
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((item) => item.message)
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      })
    }

    return sendError(res, 500, 'Unable to update student profile')
  }
}
