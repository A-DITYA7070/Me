import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import publicRoutes from "./routes/public.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import { ensureSeed } from "./seed.js";

const { PORT = 5000, MONGODB_URI, JWT_SECRET, ADMIN_PASSWORD, CLIENT_ORIGIN = "http://localhost:5173" } = process.env;

for (const [key, value] of Object.entries({ MONGODB_URI, JWT_SECRET, ADMIN_PASSWORD })) {
  if (!value) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const app = express();
app.set("trust proxy", 1); // Render / nginx sit in front of us
app.use(helmet());
app.use(
  cors({
    origin: CLIENT_ORIGIN.split(",").map((o) => o.trim().replace(/\/$/, "")).filter(Boolean),
  })
);
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});
app.use("/api", publicRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", (req, res) => res.status(404).json({ error: "Not found" }));

// Express 5 forwards rejected promises from async handlers here.
app.use((err, req, res, next) => {
  if (err.name === "ValidationError") {
    const first = Object.values(err.errors)[0];
    return res.status(400).json({ error: first?.message || "Invalid data" });
  }
  if (err.name === "CastError") return res.status(400).json({ error: "Invalid id" });
  if (err.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid JSON" });
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

await mongoose.connect(MONGODB_URI);
console.log("Connected to MongoDB");
await ensureSeed();
app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
