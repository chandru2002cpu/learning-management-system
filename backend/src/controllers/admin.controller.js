import mongoose from "mongoose";
import User, { ROLES } from "../models/user.model.js";
import Lesson from "../models/lesson.model.js";
import Payment from "../models/payment.model.js";
import Review from "../models/review.model.js";

const PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

function pagination(query) {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(Number.parseInt(query.limit, 10) || PAGE_SIZE, 1),
    MAX_PAGE_SIZE,
  );
  return { page, limit, skip: (page - 1) * limit };
}

function searchValue(query) {
  return String(query.search || "").trim();
}

function textSearch(value, fields) {
  if (!value) return null;
  const expression = new RegExp(
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "i",
  );
  return { $or: fields.map((field) => ({ [field]: expression })) };
}

function validId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function sendError(res, error, fallback) {
  const status = error.status || (error.name === "ValidationError" ? 400 : 500);
  return res.status(status).json({
    success: false,
    message: status === 500 ? fallback : error.message,
  });
}

function sendPage(res, message, key, items, total, { page, limit }) {
  return res.status(200).json({
    success: true,
    message,
    data: {
      [key]: items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
}

async function listUsers(req, res, role) {
  try {
    const { page, limit, skip } = pagination(req.query);
    const filter = {};
    if (role) filter.role = role;
    if (!role && req.query.role && ROLES.includes(req.query.role))
      filter.role = req.query.role;
    if (req.query.active === "true") filter.isActive = true;
    if (req.query.active === "false") filter.isActive = false;

    const search = textSearch(searchValue(req.query), ["name", "email"]);
    if (search) Object.assign(filter, search);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    return sendPage(
      res,
      role
        ? `${role[0].toUpperCase()}${role.slice(1)}s retrieved`
        : "Users retrieved",
      "users",
      users,
      total,
      { page, limit },
    );
  } catch (error) {
    return sendError(res, error, "Unable to load users");
  }
}

export function getUsers(req, res) {
  return listUsers(req, res);
}

export function getStudents(req, res) {
  return listUsers(req, res, "student");
}

export function getTutors(req, res) {
  return listUsers(req, res, "tutor");
}

export async function patchUserStatus(req, res) {
  try {
    const { id } = req.params;
    if (!validId(id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid user id" });
    if (String(req.user._id) === String(id))
      return res
        .status(400)
        .json({
          success: false,
          message: "You cannot change your own account status",
        });
    if (typeof req.body?.isActive !== "boolean")
      return res
        .status(400)
        .json({ success: false, message: "isActive must be a boolean" });

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: req.body.isActive },
      { new: true, runValidators: true },
    ).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    return res
      .status(200)
      .json({
        success: true,
        message: `User ${user.isActive ? "activated" : "deactivated"}`,
        data: { user },
      });
  } catch (error) {
    return sendError(res, error, "Unable to update user status");
  }
}

export async function patchUserRole(req, res) {
  try {
    const { id } = req.params;
    if (!validId(id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid user id" });
    if (String(req.user._id) === String(id))
      return res
        .status(400)
        .json({ success: false, message: "You cannot change your own role" });
    if (!ROLES.includes(req.body?.role))
      return res
        .status(400)
        .json({
          success: false,
          message: "Role must be student, tutor, or admin",
        });

    const user = await User.findByIdAndUpdate(
      id,
      { role: req.body.role },
      { new: true, runValidators: true },
    ).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    return res
      .status(200)
      .json({ success: true, message: "User role updated", data: { user } });
  } catch (error) {
    return sendError(res, error, "Unable to update user role");
  }
}

export async function getLessons(req, res) {
  try {
    const { page, limit, skip } = pagination(req.query);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const search = textSearch(searchValue(req.query), ["title", "subject"]);
    if (search) Object.assign(filter, search);

    const [lessons, total] = await Promise.all([
      Lesson.find(filter)
        .populate("student", "name email")
        .populate("tutor", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Lesson.countDocuments(filter),
    ]);
    return sendPage(res, "Lessons retrieved", "lessons", lessons, total, {
      page,
      limit,
    });
  } catch (error) {
    return sendError(res, error, "Unable to load lessons");
  }
}

export async function getPayments(req, res) {
  try {
    const { page, limit, skip } = pagination(req.query);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const search = textSearch(searchValue(req.query), [
      "orderId",
      "paymentId",
      "currency",
    ]);
    if (search) Object.assign(filter, search);

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate("student", "name email")
        .populate("tutor", "name email")
        .populate("lesson", "title subject")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(filter),
    ]);
    return sendPage(res, "Payments retrieved", "payments", payments, total, {
      page,
      limit,
    });
  } catch (error) {
    return sendError(res, error, "Unable to load payments");
  }
}

export async function getReviews(req, res) {
  try {
    const { page, limit, skip } = pagination(req.query);
    const filter = {};
    if (req.query.rating) filter.rating = Number(req.query.rating);
    const search = textSearch(searchValue(req.query), ["comment"]);
    if (search) Object.assign(filter, search);

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("student", "name email")
        .populate("tutor", "name email")
        .populate("lesson", "title subject")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter),
    ]);
    return sendPage(res, "Reviews retrieved", "reviews", reviews, total, {
      page,
      limit,
    });
  } catch (error) {
    return sendError(res, error, "Unable to load reviews");
  }
}

export async function getAdminDashboard(req, res) {
  try {
    const [users, students, tutors, lessons, payments, reviews] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "student" }),
        User.countDocuments({ role: "tutor" }),
        Lesson.countDocuments(),
        Payment.countDocuments(),
        Review.countDocuments(),
      ]);
    return res.status(200).json({
      success: true,
      message: "Admin dashboard retrieved",
      data: { counts: { users, students, tutors, lessons, payments, reviews } },
    });
  } catch (error) {
    return sendError(res, error, "Unable to load admin dashboard");
  }
}
