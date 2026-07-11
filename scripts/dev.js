import { spawn } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, "..");

const backend = spawn("node", ["--import", "tsx", path.join(root, "backend/src/index.ts")], {
  stdio: "inherit",
  env: { ...process.env },
});

setTimeout(() => {
  const frontend = spawn("node", [path.join(root, "node_modules/.bin/vite")], {
    cwd: path.join(root, "frontend"),
    stdio: "inherit",
    env: { ...process.env },
  });

  process.on("SIGINT", () => {
    backend.kill();
    frontend.kill();
    process.exit();
  });
}, 2000);
