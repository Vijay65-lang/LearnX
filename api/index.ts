import express from "express";
import { initDatabase } from "../server/db";
import { apiRouter } from "../server/routes";

const app = express();

app.use(express.json());

let databaseReady = false;
let databasePromise: Promise<void> | null = null;

async function ensureDatabase(): Promise<void> {
  if (databaseReady) {
    return;
  }

  if (!databasePromise) {
    databasePromise = initDatabase()
      .then(() => {
        databaseReady = true;
        console.log("LearnX database initialized successfully.");
      })
      .catch((error) => {
        databasePromise = null;
        console.warn("Database initialization notice (resilient fallback will handle requests):", error);
      });
  }

  try {
    await databasePromise;
  } catch (err) {
    console.warn("Continuing request with resilient database fallback:", err);
  }
}

app.use(async (_req, _res, next) => {
  try {
    await ensureDatabase();
  } catch (error) {
    console.warn("ensureDatabase error handled safely:", error);
  }
  next();
});

// Support both /api/* and root mounted routes
app.use("/api", apiRouter);
app.use("/", apiRouter);

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    app: "LearnX Mastery Platform",
  });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    app: "LearnX Mastery Platform",
  });
});

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("LearnX API error:", error);

    if (res.headersSent) {
      return;
    }

    res.status(500).json({
      error: "Internal server error",
      message:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
);

export default app;
