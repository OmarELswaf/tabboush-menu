import bcrypt from "bcryptjs";
import { connectDB } from "../_lib/db.js";
import { User } from "../_lib/models.js";
import { signToken, send } from "../_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" });
  try {
    const { name, email, password } = req.body || {};
    if (!name?.trim() || !email?.trim() || !password) return send(res, 400, { error: "الاسم والإيميل وكلمة السر مطلوبين" });
    if (password.length < 6) return send(res, 400, { error: "كلمة السر لازم تكون 6 حروف على الأقل" });
    await connectDB();
    const exists = await User.findOne({ email: email.trim().toLowerCase() });
    if (exists) return send(res, 409, { error: "الإيميل ده مسجل قبل كده — جرّب تسجيل الدخول" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name: name.trim(), email: email.trim().toLowerCase(), passwordHash });
    send(res, 201, { token: signToken(user), user: { name: user.name, email: user.email } });
  } catch (e) {
    send(res, 500, { error: "حصل خطأ في السيرفر" });
  }
}
