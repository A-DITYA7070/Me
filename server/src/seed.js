import { Profile, Project, Experience } from "./models.js";
import { profile, projects, experience } from "./seed-data.js";

/**
 * On first start (empty database) fill in starter content so the site
 * isn't blank. After that, edit everything from the /admin page.
 */
export async function ensureSeed() {
  if (await Profile.exists({})) return;
  await Profile.create(profile);
  await Project.insertMany(projects.map((p, i) => ({ ...p, order: i })));
  await Experience.insertMany(experience.map((x, i) => ({ ...x, order: i })));
  console.log("Seeded database with starter content");
}
