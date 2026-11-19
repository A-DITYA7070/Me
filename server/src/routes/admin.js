import { Router } from "express";
import jwt from "jsonwebtoken";
import { Profile, Project, Experience, Message } from "../models.js";

const router = Router();

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== "admin") throw new Error("not admin");
    next();
  } catch {
    res.status(401).json({ error: "Please log in again" });
  }
}

router.use(requireAdmin);

// Never let the client overwrite Mongo's own bookkeeping fields.
const strip = ({ _id, __v, createdAt, updatedAt, ...rest } = {}) => rest;

/* ---------- Profile (single document) ---------- */
router.get("/profile", async (req, res) => {
  res.json(await Profile.findOne().lean());
});

router.put("/profile", async (req, res) => {
  const doc = await Profile.findOneAndUpdate({}, strip(req.body), {
    new: true,
    upsert: true,
    runValidators: true,
    setDefaultsOnInsert: true,
  });
  res.json(doc);
});

/* ---------- Projects & experience (lists) ---------- */
function crud(path, Model) {
  router.get(`/${path}`, async (req, res) => {
    res.json(await Model.find().sort({ order: 1, createdAt: 1 }));
  });
  router.post(`/${path}`, async (req, res) => {
    res.status(201).json(await Model.create(strip(req.body)));
  });
  router.put(`/${path}/:id`, async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, strip(req.body), { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  });
  router.delete(`/${path}/:id`, async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.status(204).end();
  });
}

crud("projects", Project);
crud("experience", Experience);

/* ---------- Contact messages ---------- */
router.get("/messages", async (req, res) => {
  res.json(await Message.find().sort({ createdAt: -1 }));
});

router.patch("/messages/:id", async (req, res) => {
  const doc = await Message.findByIdAndUpdate(req.params.id, { read: Boolean(req.body?.read) }, { new: true });
  if (!doc) return res.status(404).json({ error: "Not found" });
  res.json(doc);
});

router.delete("/messages/:id", async (req, res) => {
  const doc = await Message.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ error: "Not found" });
  res.status(204).end();
});

export default router;
