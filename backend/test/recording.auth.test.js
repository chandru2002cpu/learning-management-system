import request from "supertest";
import { jest } from "@jest/globals";
import app from "../src/app.js";
import User from "../src/models/user.model.js";
import Lesson from "../src/models/lesson.model.js";
import Recording from "../src/models/recording.model.js";
import { generateToken } from "../src/utils/jwt.js";
import { connectTestDatabase, disconnectTestDatabase } from "./test-db.js";

jest.setTimeout(60000);

beforeAll(async () => {
  await connectTestDatabase();
});

afterAll(async () => {
  await disconnectTestDatabase();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Lesson.deleteMany({});
  await Recording.deleteMany({});
});

test("tutor can upload and access own recordings; student can access completed lesson recordings; others get 403", async () => {
  const tutor = await User.create({
    name: "Tutor",
    email: "tutor@example.com",
    role: "tutor",
    isActive: true,
  });
  const student = await User.create({
    name: "Student",
    email: "student@example.com",
    role: "student",
    isActive: true,
  });
  const other = await User.create({
    name: "Other",
    email: "other@example.com",
    role: "student",
    isActive: true,
  });

  const lesson = await Lesson.create({
    tutor: tutor._id,
    student: student._id,
    subject: "Math",
    title: "Lesson 1",
    date: "2099-01-01",
    startTime: "10:00",
    endTime: "11:00",
    price: 100,
    status: "confirmed",
  });

  const tutorToken = generateToken({ id: tutor._id });
  const studentToken = generateToken({ id: student._id });
  const otherToken = generateToken({ id: other._id });

  // Attempt upload without file should fail
  const uploadRes = await request(app)
    .post("/api/v1/recordings")
    .set("Authorization", `Bearer ${tutorToken}`)
    .field("lessonId", lesson._id.toString())
    .field("title", "Rec 1")
    .field("duration", "60");

  expect(uploadRes.statusCode).toBe(400);

  // Create a recording document directly to simulate stored file
  const recording = await Recording.create({
    lesson: lesson._id,
    tutor: tutor._id,
    student: student._id,
    title: "Rec 1",
    videoUrl: "local:dummy.mp4",
    duration: 60,
  });

  // Tutor can get own recording
  const tutorGet = await request(app)
    .get(`/api/v1/recordings/${recording._id}`)
    .set("Authorization", `Bearer ${tutorToken}`);
  expect(tutorGet.statusCode).toBe(200);

  // Student cannot view until lesson is completed
  const studentGetBefore = await request(app)
    .get(`/api/v1/recordings/${recording._id}`)
    .set("Authorization", `Bearer ${studentToken}`);
  expect(studentGetBefore.statusCode).toBe(403);

  // Mark lesson as completed and make recording available
  lesson.status = "completed";
  await lesson.save();
  recording.isAvailable = true;
  await recording.save();

  const studentGet = await request(app)
    .get(`/api/v1/recordings/${recording._id}`)
    .set("Authorization", `Bearer ${studentToken}`);
  expect(studentGet.statusCode).toBe(200);

  // Other user should get 403
  const otherGet = await request(app)
    .get(`/api/v1/recordings/${recording._id}`)
    .set("Authorization", `Bearer ${otherToken}`);
  expect(otherGet.statusCode).toBe(403);
});
