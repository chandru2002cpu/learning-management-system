import mongoose from "mongoose";
import Review from "../models/review.model.js";
import Lesson from "../models/lesson.model.js";
import TutorProfile from "../models/tutorProfile.model.js";

async function recalcTutorRating(tutorId) {
  const agg = await Review.aggregate([
    { $match: { tutor: new mongoose.Types.ObjectId(tutorId) } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const avg = agg[0]?.avg ?? 0;
  const count = agg[0]?.count ?? 0;

  await TutorProfile.findOneAndUpdate(
    { user: tutorId },
    { rating: Math.round(avg * 10) / 10, totalReviews: count },
  );
}

function validateRating(rating) {
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    const err = new Error("Rating must be a number from 1 to 5");
    err.status = 400;
    throw err;
  }
}

function requireStudent(user) {
  if (user?.role !== "student") {
    const err = new Error("Only students can review lessons");
    err.status = 403;
    throw err;
  }
}

function validateTutorId(tutorId) {
  if (!mongoose.Types.ObjectId.isValid(tutorId)) {
    const err = new Error("Invalid tutor id");
    err.status = 400;
    throw err;
  }
}

export async function createReview(user, { lessonId, rating, comment }) {
  requireStudent(user);
  validateRating(rating);

  if (!mongoose.Types.ObjectId.isValid(lessonId)) {
    const err = new Error("Invalid lesson id");
    err.status = 400;
    throw err;
  }

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    const err = new Error("Lesson not found");
    err.status = 404;
    throw err;
  }

  if (String(lesson.student) !== String(user._id)) {
    const err = new Error(
      "Only the student who booked the lesson may review it",
    );
    err.status = 403;
    throw err;
  }

  if (lesson.status !== "completed") {
    const err = new Error("Only completed lessons can be reviewed");
    err.status = 400;
    throw err;
  }

  const existing = await Review.findOne({ lesson: lessonId });
  if (existing) {
    const err = new Error("Review for this lesson already exists");
    err.status = 400;
    throw err;
  }

  let review;
  try {
    review = await Review.create({
      student: user._id,
      tutor: lesson.tutor,
      lesson: lessonId,
      rating,
      comment,
    });
  } catch (error) {
    if (error?.code === 11000) {
      const err = new Error("Review for this lesson already exists");
      err.status = 400;
      throw err;
    }
    throw error;
  }

  await recalcTutorRating(lesson.tutor);

  return review;
}

export async function updateReview(user, reviewId, { rating, comment }) {
  requireStudent(user);
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    const err = new Error("Invalid review id");
    err.status = 400;
    throw err;
  }

  const review = await Review.findById(reviewId);
  if (!review) {
    const err = new Error("Review not found");
    err.status = 404;
    throw err;
  }

  if (String(review.student) !== String(user._id)) {
    const err = new Error("Not authorized");
    err.status = 403;
    throw err;
  }

  if (rating !== undefined) {
    validateRating(rating);
  }

  review.rating = rating ?? review.rating;
  review.comment = comment ?? review.comment;
  await review.save();

  await recalcTutorRating(review.tutor);

  return review;
}

export async function deleteReview(user, reviewId) {
  requireStudent(user);
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    const err = new Error("Invalid review id");
    err.status = 400;
    throw err;
  }

  const review = await Review.findById(reviewId);
  if (!review) {
    const err = new Error("Review not found");
    err.status = 404;
    throw err;
  }

  if (String(review.student) !== String(user._id)) {
    const err = new Error("Not authorized");
    err.status = 403;
    throw err;
  }

  await Review.deleteOne({ _id: reviewId });

  await recalcTutorRating(review.tutor);

  return;
}

export async function listReviewsForTutor(
  tutorId,
  { limit = 20, offset = 0 } = {},
) {
  validateTutorId(tutorId);
  const filter = { tutor: tutorId };
  const reviews = await Review.find(filter)
    .sort({ createdAt: -1 })
    .skip(Number(offset))
    .limit(Number(limit))
    .populate({ path: "student", select: "name avatar" });

  return reviews;
}

export async function getAverageRating(tutorId) {
  validateTutorId(tutorId);
  const agg = await Review.aggregate([
    { $match: { tutor: new mongoose.Types.ObjectId(tutorId) } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  return { avg: agg[0]?.avg ?? 0, count: agg[0]?.count ?? 0 };
}
