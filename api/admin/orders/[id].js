import { Order, ORDER_STATUSES } from "../../_lib/models.js";
import { authAdmin, isPublicDemo, DEMO_READONLY_MSG, send } from "../../_lib/auth.js";

// PATCH /api/admin/orders/:id { status } — update an order's status (admin).
export default async function handler(req, res) {
  if (req.method !== "PATCH") return send(res, 405, { error: "Method not allowed" });
  try {
    const r = await authAdmin(req);
    if (!r) return send(res, 401, { error: "سجّل دخول كإدارة الأول" });
    if (isPublicDemo(r)) return send(res, 403, { error: DEMO_READONLY_MSG });
    const { status } = req.body || {};
    if (!ORDER_STATUSES.includes(status)) return send(res, 400, { error: "حالة غير صحيحة" });
    const order = await Order.findOne({ _id: req.query.id, restaurant: r._id });
    if (!order) return send(res, 404, { error: "الطلب مش موجود" });
    order.status = status;
    await order.save();
    send(res, 200, { order });
  } catch (e) {
    send(res, 500, { error: "حصل خطأ في السيرفر" });
  }
}
