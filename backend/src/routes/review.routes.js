import { Router } from "express";
import {
  postReview,
  putReview,
  delReview,
  getTutorReviews,
  getTutorAverage,
} from "../controllers/review.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", requireAuth, requireRole("student"), postReview);
router.put("/:id", requireAuth, requireRole("student"), putReview);
router.delete("/:id", requireAuth, requireRole("student"), delReview);
router.get("/tutor/:id", getTutorReviews);
router.get("/tutor/:id/average", getTutorAverage);

export default router;
