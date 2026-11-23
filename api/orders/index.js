import { connectDB } from "../_lib/db.js";
import { Order, Restaurant } from "../_lib/models.js";
import { authUser, send } from "../_lib/auth.js";

// POST /api/orders { slug, type, notes, phone, items } — place an order (logged-in customer)
// GET  /api/orders?slug=X — the caller's order history at that restaurant (logged-in customer)
export default async function handler(req, res) {
  try {
    await connectDB();
    const user = await authUser(req);
    if (!user) return send(res, 401, { error: "سجّل الدخول الأول عشان تطلب" });

    const slug = String((req.method === "GET" ? req.query.slug : req.body?.slug) || "").toLowerCase();
    const restaurant = await Restaurant.findOne({ slug });
    if (!restaurant) return send(res, 404, { error: "المطعم مش موجود" });

    if (req.method === "POST") {
      const { type, notes, phone, items } = req.body || {};
      if (!Array.isArray(items) || items.length === 0) return send(res, 400, { error: "الطلب فاضي" });
      if (!["استلام من الفرع", "دليفري", "طاولة بالمطعم"].includes(type)) return send(res, 400, { error: "نوع الطلب غير صحيح" });
      // Prices are recomputed from the tenant's stored menu, never trusted from the client.
      const menu = new Map(restaurant.items.map((m) => [m.id, m]));
      const clean = [];
      for (const i of items) {
        const m = menu.get(String(i.itemId || ""));
        const qty = Number(i.qty);
        if (m && qty > 0) clean.push({ itemId: m.id, name: m.name, price: m.price, qty });
      }
      if (clean.length === 0) return send(res, 400, { error: "الأصناف دي مش موجودة في المنيو" });
      const total = clean.reduce((s, i) => s + i.price * i.qty, 0);
      const order = await Order.create({
        restaurant: restaurant._id,
        customer: user._id,
        customerName: user.name,
        phone: String(phone || ""),
        type,
        notes: String(notes || ""),
        items: clean,
        total,
      });
      return send(res, 201, { order });
    }

    if (req.method === "GET") {
      const orders = await Order.find({ restaurant: restaurant._id, customer: user._id }).sort({ createdAt: -1 }).limit(100);
      return send(res, 200, { orders });
    }

    send(res, 405, { error: "Method not allowed" });
  } catch (e) {
    send(res, 500, { error: "حصل خطأ في السيرفر" });
  }
}
