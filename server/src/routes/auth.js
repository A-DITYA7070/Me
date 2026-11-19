import { Router } from "express";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many login attempts. Try again in 15 minutes." },
});

// Hash both sides so timingSafeEqual gets equal-length buffers.
const digest = (s) => crypto.createHash("sha256").update(String(s)).digest();

router.post("/login", loginLimiter, (req, res) => {
  const password = req.body?.password ?? "";
  const ok = crypto.timingSafeEqual(digest(password), digest(process.env.ADMIN_PASSWORD));
  if (!ok) return res.status(401).json({ error: "Wrong password" });
  const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

export default router;
