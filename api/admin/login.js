import bcrypt from "bcryptjs";
import { connectDB } from "../_lib/db.js";
import { Restaurant } from "../_lib/models.js";
import { signAdminToken, send } from "../_lib/auth.js";

// POST /api/admin/login { slug, code } — restaurant owner/staff login.
export default async function handler(req, res) {
  if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" });
  try {
    const { slug, code } = req.body || {};
    if (!slug || !code) return send(res, 400, { error: "اكتب اسم المطعم والكود" });
    await connectDB();
    const r = await Restaurant.findOne({ slug: String(slug).toLowerCase().trim() });
    if (!r || !(await bcrypt.compare(String(code), r.adminCodeHash))) {
      return send(res, 401, { error: "اسم المطعم أو الكود غلط" });
    }
    send(res, 200, { token: signAdminToken(r), restaurant: { slug: r.slug, name: r.name } });
  } catch (e) {
    send(res, 500, { error: "حصل خطأ في السيرفر" });
  }
}
