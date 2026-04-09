import { config as loadEnv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(currentDir, "../../../..");

loadEnv({ path: path.join(workspaceRoot, ".env.development") });
loadEnv({ path: path.join(workspaceRoot, ".env") });

