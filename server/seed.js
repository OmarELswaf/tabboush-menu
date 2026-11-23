// Seeds (or refreshes) the Tabboush sample tenant in the database.
// Usage: MONGODB_URI=... JWT_SECRET=... node server/seed.js
import bcrypt from "bcryptjs";
import { connectDB } from "../api/_lib/db.js";
import { Restaurant } from "../api/_lib/models.js";
import { DEFAULT_TENANT, DEFAULT_ADMIN_CODE } from "../src/defaultTenant.js";

await connectDB();
const adminCodeHash = await bcrypt.hash(DEFAULT_ADMIN_CODE, 10);
const { slug, ...data } = DEFAULT_TENANT;
const res = await Restaurant.findOneAndUpdate(
  { slug },
  { $set: { ...data, adminCodeHash } },
  { upsert: true, new: true }
);
console.log(`Seeded tenant "${res.name}" at /r/${res.slug} (admin code: ${DEFAULT_ADMIN_CODE})`);
process.exit(0);
