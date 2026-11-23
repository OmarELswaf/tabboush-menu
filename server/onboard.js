// Onboard a new restaurant tenant in minutes — no code changes needed.
// Usage:
//   MONGODB_URI=... node server/onboard.js --slug my-place --name "مطعمي" \
//     --code secret-admin-code --whatsapp 201XXXXXXXXX \
//     [--tagline ".."] [--area ".."] [--primary "#0ea5e9"] [--dark "#0369a1"] [--light "#e0f2fe"]
// The new tenant gets the sample menu as a starting point; the owner edits
// everything from the admin panel at /admin.
import bcrypt from "bcryptjs";
import { connectDB } from "../api/_lib/db.js";
import { Restaurant } from "../api/_lib/models.js";
import { DEFAULT_TENANT } from "../src/defaultTenant.js";

const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  args[process.argv[i].replace(/^--/, "")] = process.argv[i + 1];
}

const { slug, name, code } = args;
if (!slug || !name || !code) {
  console.error('Required: --slug <slug> --name "<name>" --code <admin-code>');
  process.exit(1);
}
if (!/^[a-z0-9-]+$/.test(slug)) {
  console.error("Slug must be lowercase letters, numbers and dashes only.");
  process.exit(1);
}

await connectDB();
const existing = await Restaurant.findOne({ slug });
if (existing) {
  console.error(`Slug "${slug}" is already taken.`);
  process.exit(1);
}

await Restaurant.create({
  slug,
  name,
  tagline: args.tagline || "",
  area: args.area || "",
  whatsappNumber: (args.whatsapp || "").replace(/\D/g, ""),
  logoUrl: args.logo || "",
  theme: {
    primary: args.primary || "#16a34a",
    dark: args.dark || "#15803d",
    light: args.light || "#dcfce7",
  },
  adminCodeHash: await bcrypt.hash(code, 10),
  categories: DEFAULT_TENANT.categories,
  items: DEFAULT_TENANT.items,
});
console.log(`Created "${name}" at /r/${slug} — owner logs in at /admin with slug "${slug}" and the code you set.`);
process.exit(0);
