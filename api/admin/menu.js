import { authAdmin, isPublicDemo, DEMO_READONLY_MSG, send } from "../_lib/auth.js";

// PUT /api/admin/menu { categories, items } — replace the tenant's whole menu (admin).
// One save action keeps the editor simple: the panel edits locally then saves.
export default async function handler(req, res) {
  if (req.method !== "PUT") return send(res, 405, { error: "Method not allowed" });
  try {
    const r = await authAdmin(req);
    if (!r) return send(res, 401, { error: "سجّل دخول كإدارة الأول" });
    if (isPublicDemo(r)) return send(res, 403, { error: DEMO_READONLY_MSG });
    const { categories, items } = req.body || {};
    if (!Array.isArray(categories) || !Array.isArray(items)) return send(res, 400, { error: "بيانات المنيو ناقصة" });
    r.categories = categories.map((c) => String(c).trim()).filter(Boolean).slice(0, 30);
    r.items = items
      .filter((i) => i && i.name && i.cat && i.price >= 0)
      .map((i) => ({
        id: String(i.id || Math.random().toString(36).slice(2, 9)),
        cat: String(i.cat),
        name: String(i.name),
        desc: String(i.desc || ""),
        price: Number(i.price),
        img: String(i.img || ""),
        tag: String(i.tag || ""),
      }))
      .slice(0, 300);
    await r.save();
    send(res, 200, { ok: true, count: r.items.length });
  } catch (e) {
    send(res, 500, { error: "حصل خطأ في السيرفر" });
  }
}
