import mongoose from "mongoose";
import TutorProfile from "../models/tutorProfile.model.js";
import { DAYS } from "../models/tutorProfile.model.js";
import Review from "../models/review.model.js";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatTutor(profile, reviews = []) {
  const user = profile.user;

  const mappedReviews = (reviews || profile.reviews || []).map((review) => ({
    id: review._id || review.id,
    authorName: review.student?.name || review.authorName || "",
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
  }));

  return {
    id: user._id,
    name: user.name,
    avatar: user.avatar || "",
    bio: user.bio || "",
    qualifications: profile.qualifications || [],
    expertise: profile.expertise || [],
    experience: profile.experience ?? 0,
    subjects: profile.subjects || [],
    hourlyRate: profile.hourlyRate ?? 0,
    rating: profile.rating ?? 0,
    totalReviews: profile.totalReviews ?? reviews.length,
    reviews: mappedReviews,
    availability: profile.availability || [],
  };
}

function buildFilter(query) {
  const filter = {};

  if (query.subject?.trim()) {
    filter.subjects = new RegExp(`^${escapeRegex(query.subject.trim())}$`, "i");
  }

  if (query.price !== undefined && query.price !== "") {
    filter.hourlyRate = { $lte: Number(query.price) };
  }

  if (query.rating !== undefined && query.rating !== "") {
    filter.rating = { $gte: Number(query.rating) };
  }

  if (query.availability?.trim()) {
    filter["availability.day"] = query.availability.trim().toLowerCase();
  }

  return filter;
}

export function validateTutorQuery(req, res, next) {
  const errors = [];
  const { subject, price, rating, availability } = req.query;

  if (subject !== undefined && String(subject).trim().length > 80) {
    errors.push("Subject cannot exceed 80 characters");
  }

  if (price !== undefined && price !== "") {
    const value = Number(price);
    if (!Number.isFinite(value) || value < 0) {
      errors.push("Price must be a number of 0 or greater");
    }
  }

  if (rating !== undefined && rating !== "") {
    const value = Number(rating);
    if (!Number.isFinite(value) || value < 0 || value > 5) {
      errors.push("Rating must be a number from 0 to 5");
    }
  }

  if (availability !== undefined && availability !== "") {
    if (!DAYS.includes(String(availability).trim().toLowerCase())) {
      errors.push("Availability must be a day from monday to sunday");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
}

export async function listTutors(req, res) {
  try {
    const filter = buildFilter(req.query);
    const profiles = await TutorProfile.find(filter).populate({
      path: "user",
      match: { role: "tutor", isActive: true },
      select: "name avatar bio role isActive",
    });

    const validProfiles = profiles.filter((profile) => profile.user);

    const tutors = await Promise.all(
      validProfiles.map(async (profile) => {
        const reviews = await Review.find({ tutor: profile.user._id })
          .sort({ createdAt: -1 })
          .limit(20)
          .populate({ path: "student", select: "name avatar" });

        return formatTutor(profile, reviews);
      }),
    );

    return res.status(200).json({
      success: true,
      message: tutors.length ? "Tutors retrieved" : "No tutors found",
      data: { tutors },
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Unable to load tutors",
    });
  }
}

export async function getTutor(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid tutor id",
    });
  }

  try {
    const profile = await TutorProfile.findOne({ user: id }).populate({
      path: "user",
      match: { role: "tutor", isActive: true },
      select: "name avatar bio role isActive",
    });

    if (!profile?.user) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    const reviews = await Review.find({ tutor: profile.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate({ path: "student", select: "name avatar" });

    return res.status(200).json({
      success: true,
      message: "Tutor retrieved",
      data: { tutor: formatTutor(profile, reviews) },
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Unable to load tutor",
    });
  }
}
