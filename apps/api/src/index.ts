import "./config/loadEnv.js";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middleware/errorHandler.js";
import { router } from "./routes/index.js";
import { logAiProviderStatus } from "./services/aiOrchestrator.js";

const app = express();

app.use(
  cors({
    origin: (origin, cb) => {
      const allowed = [process.env.WEB_ORIGIN ?? "http://localhost:5173", "http://localhost:5173", "http://web:5173"];
      cb(null, !origin || allowed.includes(origin));
    },
    credentials: true
  })
);

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api", router);
app.use(errorHandler);

const PORT = process.env.PORT ?? 4000;
app.listen(PORT, () => {
  logAiProviderStatus();
  console.log(`API running on :${PORT}`);
});
