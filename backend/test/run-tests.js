import { spawn } from "child_process";
import path from "path";

const jest = spawn(
  process.execPath,
  [path.resolve("./node_modules/.bin/jest")],
  {
    stdio: "inherit",
    shell: true,
  },
);

jest.on("exit", (code) => process.exit(code || 0));
