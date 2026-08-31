import { existsSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const nextBinPath = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
const wasmDirPath = path.join(
  process.cwd(),
  "node_modules",
  "@next",
  "swc-wasm-nodejs",
);

if (existsSync(path.join(wasmDirPath, "wasm.js"))) {
  process.env.NEXT_TEST_WASM_DIR = wasmDirPath;
}

const args = process.argv.slice(2);
const child = spawn(process.execPath, [nextBinPath, ...args], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
