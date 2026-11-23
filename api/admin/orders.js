import { Order } from "../_lib/models.js";
import { authAdmin, send } from "../_lib/auth.js";

// GET /api/admin/orders — every order for the caller's restaurant (admin).
export default async function handler(req, res) {
  if (req.method !== "GET") return send(res, 405, { error: "Method not allowed" });
  try {
    const r = await authAdmin(req);
    if (!r) return send(res, 401, { error: "سجّل دخول كإدارة الأول" });
    const orders = await Order.find({ restaurant: r._id }).sort({ createdAt: -1 }).limit(300);
    send(res, 200, { orders });
  } catch (e) {
    send(res, 500, { error: "حصل خطأ في السيرفر" });
  }
}
