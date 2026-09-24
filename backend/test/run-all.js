import { spawn } from "child_process";
import path from "path";
import "dotenv/config";

function resolveTestMongoUri() {
  if (process.env.TEST_MONGO_URI) return process.env.TEST_MONGO_URI;
  if (!process.env.MONGO_URI) {
    throw new Error(
      "Set TEST_MONGO_URI to an isolated local MongoDB test database",
    );
  }

  const uri = new URL(process.env.MONGO_URI);
  if (!["localhost", "127.0.0.1", "::1"].includes(uri.hostname)) {
    throw new Error(
      "Refusing to run destructive tests against a non-local MONGO_URI; set TEST_MONGO_URI explicitly",
    );
  }
  uri.pathname = "/lms_test";
  return uri.toString();
}

const jestPath = path.resolve("./node_modules/jest/bin/jest.js");
const args = ["--experimental-vm-modules", jestPath, "--runInBand"];

process.env.NODE_ENV = "test";
process.env.TEST_MONGO_URI = resolveTestMongoUri();

const p = spawn(process.execPath, args, { stdio: "inherit", env: process.env });

p.on("exit", (code) => process.exit(code || 0));
