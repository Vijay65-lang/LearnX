import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { initDatabase } from "./server/db";
import { apiRouter } from "./server/routes";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  try {
    await initDatabase();

    console.log(
      "Relational SQLite database initialized successfully."
    );
  } catch (err) {
    console.error(
      "Failed to initialize database:",
      err
    );
  }

  app.use("/api", apiRouter);

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      app: "LearnX Mastery Platform",
    });
  });

  // API error handler - ensure JSON is returned for all API errors
  app.use("/api", (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("API error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: err?.message || "Internal server error" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: "spa",
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(
      process.cwd(),
      "dist"
    );

    app.use(express.static(distPath));

    app.get("*", (_req, res) => {
      res.sendFile(
        path.join(distPath, "index.html")
      );
    });
  }

  app.listen(
    PORT,
    "0.0.0.0",
    () => {
      console.log(
        `LearnX server running on http://0.0.0.0:${PORT}`
      );
    }
  );
}

startServer();