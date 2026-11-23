import bcrypt from "bcryptjs";
import { connectDB } from "./_lib/db.js";
import { Restaurant } from "./_lib/models.js";
import { send } from "./_lib/auth.js";
import { DEFAULT_TENANT, DEFAULT_ADMIN_CODE } from "../src/defaultTenant.js";

// POST /api/seed  (header: x-seed-key) — one-shot bootstrap of the sample tenant.
// Only runs when the database has no restaurants yet, so it can never overwrite
// real data. SEED_KEY is a deployment env var.
export default async function handler(req, res) {
  if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" });
  try {
    const key = process.env.SEED_KEY;
    if (!key || req.headers["x-seed-key"] !== key) return send(res, 401, { error: "ممنوع" });
    await connectDB();
    const count = await Restaurant.countDocuments();
    if (count > 0) return send(res, 409, { error: "فيه مطاعم متسجلة بالفعل — الـ seed بيشتغل مرة واحدة بس" });
    const { slug, ...data } = DEFAULT_TENANT;
    await Restaurant.create({ slug, ...data, adminCodeHash: await bcrypt.hash(DEFAULT_ADMIN_CODE, 10) });
    send(res, 201, { ok: true, slug });
  } catch (e) {
    send(res, 500, { error: "حصل خطأ في السيرفر" });
  }
}
