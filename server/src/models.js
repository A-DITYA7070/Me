import mongoose from "mongoose";

const { Schema, model } = mongoose;
const text = { type: String, trim: true, default: "" };

const profileSchema = new Schema(
  {
    name: { type: String, trim: true, required: [true, "Name is required"] },
    initials: text,
    role: text,
    tagline: text,
    location: text,
    availability: text,
    resumeUrl: text,
    about: [{ type: String, trim: true }],
    stats: [{ _id: false, value: text, label: text }],
    skills: [{ _id: false, group: text, items: [{ type: String, trim: true }] }],
    contact: {
      email: text,
      phone: text,
      links: [{ _id: false, label: text, url: text }],
    },
  },
  { timestamps: true }
);

const projectSchema = new Schema(
  {
    title: { type: String, trim: true, required: [true, "Title is required"] },
    description: text,
    tags: [{ type: String, trim: true }],
    live: text,
    code: text,
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const experienceSchema = new Schema(
  {
    role: { type: String, trim: true, required: [true, "Role is required"] },
    company: text,
    period: text,
    points: [{ type: String, trim: true }],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const messageSchema = new Schema(
  {
    name: { type: String, trim: true, required: [true, "Please enter your name"], maxlength: [100, "Name is too long"] },
    email: {
      type: String,
      trim: true,
      required: [true, "Please enter your email"],
      maxlength: [200, "Email is too long"],
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"],
    },
    message: {
      type: String,
      trim: true,
      required: [true, "Please write a message"],
      maxlength: [5000, "Message is too long (5000 characters max)"],
    },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Profile = model("Profile", profileSchema);
export const Project = model("Project", projectSchema);
export const Experience = model("Experience", experienceSchema);
export const Message = model("Message", messageSchema);
