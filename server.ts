import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { initDatabase } from "./server/db";
import { apiRouter } from "./server/routes";

async function startServer() {
  const app = express();
  const PORT = 3000;

  try {
    await initDatabase();
    console.log("Relational SQLite database initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize database:", err);
  }

  app.use(express.json());

  // Mount API endpoints
  app.use("/api", apiRouter);

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "LearnX Mastery Platform" });
  });

  // Vite middleware for dev or static serving in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LearnX server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
