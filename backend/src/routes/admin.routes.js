import { Router } from "express";
import {
  getAdminDashboard,
  getUsers,
  getStudents,
  getTutors,
  getLessons,
  getPayments,
  getReviews,
  patchUserStatus,
  patchUserRole,
} from "../controllers/admin.controller.js";
import { protect, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/dashboard", protect, requireRole("admin"), getAdminDashboard);
router.get("/users", protect, requireRole("admin"), getUsers);
router.get("/students", protect, requireRole("admin"), getStudents);
router.get("/tutors", protect, requireRole("admin"), getTutors);
router.get("/lessons", protect, requireRole("admin"), getLessons);
router.get("/payments", protect, requireRole("admin"), getPayments);
router.get("/reviews", protect, requireRole("admin"), getReviews);
router.patch(
  "/users/:id/status",
  protect,
  requireRole("admin"),
  patchUserStatus,
);
router.patch("/users/:id/role", protect, requireRole("admin"), patchUserRole);

export default router;
