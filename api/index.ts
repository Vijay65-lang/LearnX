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
        console.error("Database initialization failed:", error);
        throw error;
      });
  }

  await databasePromise;
}

app.use(async (_req, _res, next) => {
  try {
    await ensureDatabase();
    next();
  } catch (error) {
    next(error);
  }
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
