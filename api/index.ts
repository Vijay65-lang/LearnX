import express from "express";
import { initDatabase } from "../server/db";
import { apiRouter } from "../server/routes";

const app = express();

// Standard CORS & options preflight handling
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS,PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Requested-With");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// Immediate health endpoints before any database wait
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    app: "LearnX Mastery Platform",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    app: "LearnX Mastery Platform",
    timestamp: new Date().toISOString(),
  });
});

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
      })
      .catch((error) => {
        databasePromise = null;
        console.warn("Database initialization notice (resilient fallback will handle requests):", error);
      });
  }

  try {
    // Await database init with a 1.5s max cap so serverless lambdas never freeze
    await Promise.race([
      databasePromise,
      new Promise((resolve) => setTimeout(resolve, 1500))
    ]);
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
