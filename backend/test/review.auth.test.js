import request from "supertest";
import { jest } from "@jest/globals";
import app from "../src/app.js";
import User from "../src/models/user.model.js";
import Lesson from "../src/models/lesson.model.js";
import { connectTestDatabase, disconnectTestDatabase } from "./test-db.js";

jest.setTimeout(60000);

let studentToken;
let studentUser;
let tutorUser;
let lesson;

beforeAll(async () => {
  await connectTestDatabase();
});

afterAll(async () => {
  await disconnectTestDatabase();
});

describe("Review auth rules", () => {
  test("only student who completed lesson can review", async () => {
    // create users and lesson
    studentUser = await User.create({
      name: "Stu",
      email: "stu@example.com",
      password: "password",
      role: "student",
      isActive: true,
    });
    tutorUser = await User.create({
      name: "Tut",
      email: "tut@example.com",
      password: "password",
      role: "tutor",
      isActive: true,
    });
    lesson = await Lesson.create({
      student: studentUser._id,
      tutor: tutorUser._id,
      subject: "Math",
      title: "T",
      date: "2026-01-01",
      startTime: "10:00",
      endTime: "11:00",
      price: 100,
      status: "pending",
    });

    // sign in to get token
    const login = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "stu@example.com", password: "password" });
    studentToken = login.body.data.token;

    // attempt to create review for non-completed lesson
    const res = await request(app)
      .post("/api/v1/reviews")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ lessonId: lesson._id, rating: 5, comment: "Nice" });
    expect(res.status).toBe(400);

    // mark lesson completed
    lesson.status = "completed";
    await lesson.save();

    const res2 = await request(app)
      .post("/api/v1/reviews")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ lessonId: lesson._id, rating: 5, comment: "Nice" });
    expect(res2.status).toBe(201);

    // second review should be rejected
    const res3 = await request(app)
      .post("/api/v1/reviews")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ lessonId: lesson._id, rating: 4, comment: "Again" });
    expect(res3.status).toBe(400);
  });
});
