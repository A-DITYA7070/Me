import { Router } from "express";
import rateLimit from "express-rate-limit";
import { Profile, Project, Experience, Message } from "../models.js";

const router = Router();
const byOrder = { order: 1, createdAt: 1 };

router.get("/portfolio", async (req, res) => {
  const [profile, projects, experience] = await Promise.all([
    Profile.findOne().lean(),
    Project.find().sort(byOrder).lean(),
    Experience.find().sort(byOrder).lean(),
  ]);
  res.json({ profile, projects, experience });
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many messages. Please try again in a few minutes." },
});

const clean = (v) => (typeof v === "string" ? v.trim() : "");

router.post("/messages", contactLimiter, async (req, res) => {
  const { name, email, message, website } = req.body || {};
  // "website" is a hidden honeypot field: real visitors leave it empty, bots fill it in.
  if (website) return res.status(201).json({ ok: true });
  await Message.create({ name: clean(name), email: clean(email), message: clean(message) });
  res.status(201).json({ ok: true });
});

export default router;
