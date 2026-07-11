import { execSync } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, "..");

const packages = ["shared", "backend", "frontend"];

for (const pkg of packages) {
  console.log(`Building ${pkg}...`);
  execSync(`cd ${path.join(root, pkg)} && ${path.join(root, "node_modules/.bin/tsc")}`, {
    stdio: "inherit",
  });
}
