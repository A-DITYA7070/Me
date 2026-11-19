// Starter content, inserted only when the database is empty.
// Once the site is running, edit content from the /admin page instead.

export const profile = {
  name: "Your Name",
  initials: "YN",
  role: "Full-Stack Developer",
  tagline: "I build fast, thoughtful web products — from idea to production.",
  location: "City, Country",
  availability: "Open to new opportunities",
  resumeUrl: "",
  about: [
    "I'm a developer who enjoys turning messy problems into clean, reliable software. I care about the details users feel: speed, clarity and polish.",
    "Over the past few years I've shipped products end to end — designing APIs, building interfaces, and owning deployments.",
  ],
  stats: [
    { value: "3+", label: "Years experience" },
    { value: "20+", label: "Projects shipped" },
    { value: "10+", label: "Happy clients" },
  ],
  skills: [
    { group: "Frontend", items: ["JavaScript", "TypeScript", "React", "HTML & CSS", "Tailwind"] },
    { group: "Backend", items: ["Node.js", "Express", "REST APIs"] },
    { group: "Database & Cloud", items: ["MongoDB", "Docker", "AWS"] },
    { group: "Tools", items: ["Git", "GitHub Actions", "Figma"] },
  ],
  contact: {
    email: "you@example.com",
    phone: "",
    links: [
      { label: "GitHub", url: "https://github.com/" },
      { label: "LinkedIn", url: "https://linkedin.com/in/" },
    ],
  },
};

export const projects = [
  {
    title: "Project One",
    description: "A short sentence about what this does, who it's for and the result it achieved.",
    tags: ["React", "Node.js", "MongoDB"],
    live: "https://example.com",
    code: "https://github.com/",
  },
  {
    title: "Project Two",
    description: "Describe the problem, your role and one measurable outcome.",
    tags: ["React", "Express"],
    live: "https://example.com",
    code: "https://github.com/",
  },
  {
    title: "Project Three",
    description: "Mention the most interesting technical challenge you solved.",
    tags: ["Node.js", "Docker"],
    live: "",
    code: "https://github.com/",
  },
  {
    title: "Project Four",
    description: "Side project, open-source contribution, or freelance work you're proud of.",
    tags: ["MongoDB", "AWS"],
    live: "https://example.com",
    code: "",
  },
];

export const experience = [
  {
    role: "Software Engineer",
    company: "Company Name",
    period: "2023 — Present",
    points: ["Led development of a feature used by thousands of customers.", "Improved performance and reliability of core services."],
  },
  {
    role: "Junior Developer",
    company: "Previous Company",
    period: "2021 — 2023",
    points: ["Built and maintained internal tools and dashboards.", "Collaborated with design and product on new releases."],
  },
];
