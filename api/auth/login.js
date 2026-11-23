import bcrypt from "bcryptjs";
import { connectDB } from "../_lib/db.js";
import { User } from "../_lib/models.js";
import { signToken, send } from "../_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" });
  try {
    const { email, password } = req.body || {};
    if (!email?.trim() || !password) return send(res, 400, { error: "الإيميل وكلمة السر مطلوبين" });
    await connectDB();
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return send(res, 401, { error: "الإيميل أو كلمة السر غلط" });
    }
    send(res, 200, { token: signToken(user), user: { name: user.name, email: user.email } });
  } catch (e) {
    send(res, 500, { error: "حصل خطأ في السيرفر" });
  }
}
