import {
  createReview,
  updateReview,
  deleteReview,
  listReviewsForTutor,
  getAverageRating,
} from "../services/review.service.js";

function sendError(res, error, fallback) {
  const status = error.status || 500;
  return res.status(status).json({
    success: false,
    message: status === 500 ? fallback : error.message,
  });
}

export async function postReview(req, res) {
  const { lessonId, rating, comment } = req.body ?? {};
  if (!lessonId || rating === undefined || rating === null || rating === "") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: ["lessonId and rating are required"],
    });
  }

  try {
    const review = await createReview(req.user, {
      lessonId,
      rating: Number(rating),
      comment: String(comment || ""),
    });
    return res
      .status(201)
      .json({ success: true, message: "Review created", data: { review } });
  } catch (error) {
    return sendError(res, error, "Unable to create review");
  }
}

export async function putReview(req, res) {
  const { id } = req.params;
  const { rating, comment } = req.body ?? {};

  try {
    const review = await updateReview(req.user, id, {
      rating:
        rating === undefined || rating === null || rating === ""
          ? undefined
          : Number(rating),
      comment,
    });
    return res
      .status(200)
      .json({ success: true, message: "Review updated", data: { review } });
  } catch (error) {
    return sendError(res, error, "Unable to update review");
  }
}

export async function delReview(req, res) {
  const { id } = req.params;
  try {
    await deleteReview(req.user, id);
    return res.status(200).json({ success: true, message: "Review deleted" });
  } catch (error) {
    return sendError(res, error, "Unable to delete review");
  }
}

export async function getTutorReviews(req, res) {
  try {
    const tutorId = req.params.id;
    const { limit, offset } = req.query;
    const reviews = await listReviewsForTutor(tutorId, { limit, offset });
    return res
      .status(200)
      .json({ success: true, message: "Reviews retrieved", data: { reviews } });
  } catch (error) {
    return sendError(res, error, "Unable to load reviews");
  }
}

export async function getTutorAverage(req, res) {
  try {
    const tutorId = req.params.id;
    const avg = await getAverageRating(tutorId);
    return res
      .status(200)
      .json({ success: true, message: "Average retrieved", data: { avg } });
  } catch (error) {
    return sendError(res, error, "Unable to load average");
  }
}
