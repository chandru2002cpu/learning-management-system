import TutorProfile from '../models/tutorProfile.model.js'
import User from '../models/user.model.js'

const emptyProfile = {
  qualifications: [],
  expertise: [],
  experience: 0,
  subjects: [],
  hourlyRate: 0,
}

async function getOrCreateProfile(userId) {
  const existing = await TutorProfile.findOne({ user: userId })

  if (existing) {
    return existing
  }

  return TutorProfile.create({ user: userId, ...emptyProfile })
}

function sendError(res, status, message) {
  return res.status(status).json({
    success: false,
    message,
  })
}

export async function getTutorProfile(req, res) {
  try {
    const tutorProfile = await getOrCreateProfile(req.user._id)

    return res.status(200).json({
      success: true,
      message: 'Tutor profile retrieved',
      data: {
        profile: {
          user: req.user.toJSON(),
          tutorProfile: tutorProfile.toJSON(),
        },
      },
    })
  } catch {
    return sendError(res, 500, 'Unable to load tutor profile')
  }
}

export async function updateTutorProfile(req, res) {
  try {
    const userUpdates = {}
    const { name, avatar, phone, bio, experience, hourlyRate } = req.body

    if (name !== undefined) userUpdates.name = name.trim()
    if (avatar !== undefined) userUpdates.avatar = avatar.trim()
    if (phone !== undefined) userUpdates.phone = phone.trim()
    if (bio !== undefined) userUpdates.bio = bio.trim()

    const user = await User.findByIdAndUpdate(req.user._id, userUpdates, {
      new: true,
      runValidators: true,
    })

    const profileUpdates = {}
    const lists = req.parsedLists || {}

    if (lists.qualifications !== undefined) profileUpdates.qualifications = lists.qualifications
    if (lists.expertise !== undefined) profileUpdates.expertise = lists.expertise
    if (lists.subjects !== undefined) profileUpdates.subjects = lists.subjects
    if (experience !== undefined && experience !== '') profileUpdates.experience = Number(experience)
    if (hourlyRate !== undefined && hourlyRate !== '') profileUpdates.hourlyRate = Number(hourlyRate)

    const tutorProfile = await TutorProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: profileUpdates, $setOnInsert: { user: req.user._id } },
      { new: true, upsert: true, runValidators: true },
    )

    return res.status(200).json({
      success: true,
      message: 'Tutor profile updated',
      data: {
        profile: {
          user: user.toJSON(),
          tutorProfile: tutorProfile.toJSON(),
        },
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

    return sendError(res, 500, 'Unable to update tutor profile')
  }
}
