import mongoose from "mongoose";

export async function connectTestDatabase() {
  if (!process.env.TEST_MONGO_URI) {
    throw new Error("TEST_MONGO_URI is required for database-backed tests");
  }
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.TEST_MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
  }
}

export async function disconnectTestDatabase() {
  await mongoose.disconnect();
}
