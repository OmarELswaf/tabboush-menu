import { connectDB } from "../_lib/db.js";
import { Restaurant } from "../_lib/models.js";
import { send } from "../_lib/auth.js";

// GET /api/restaurants/:slug — public tenant config for the menu page.
// Never exposes adminCodeHash.
export default async function handler(req, res) {
  if (req.method !== "GET") return send(res, 405, { error: "Method not allowed" });
  try {
    const slug = String(req.query.slug || "").toLowerCase();
    await connectDB();
    const r = await Restaurant.findOne({ slug });
    if (!r) return send(res, 404, { error: "المطعم مش موجود" });
    send(res, 200, {
      restaurant: {
        slug: r.slug,
        name: r.name,
        tagline: r.tagline,
        area: r.area,
        whatsappNumber: r.whatsappNumber,
        logoUrl: r.logoUrl,
        theme: r.theme,
        categories: r.categories,
        items: r.items,
      },
    });
  } catch (e) {
    send(res, 500, { error: "حصل خطأ في السيرفر" });
  }
}
