import { Router } from "express";
import { getHealth } from "../controllers/healthController.js";
import authRoutes from "./auth.routes.js";
import studentRoutes from "./student.routes.js";
import tutorRoutes from "./tutor.routes.js";
import tutorBrowseRoutes from "./tutorBrowse.routes.js";
import lessonRoutes from "./lesson.routes.js";
import paymentRoutes from "./payment.routes.js";
import recordingRoutes from "./recording.routes.js";
import adminRoutes from "./admin.routes.js";
import reviewRoutes from "./review.routes.js";

const router = Router();

router.get("/health", getHealth);
router.use("/auth", authRoutes);
router.use("/student", studentRoutes);
router.use("/tutor", tutorRoutes);
router.use("/tutors", tutorBrowseRoutes);
router.use("/lessons", lessonRoutes);
router.use("/payments", paymentRoutes);
router.use("/recordings", recordingRoutes);
router.use("/admin", adminRoutes);
router.use("/reviews", reviewRoutes);

export default router;
