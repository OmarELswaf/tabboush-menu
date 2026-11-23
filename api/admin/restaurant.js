import { Restaurant } from "../_lib/models.js";
import { authAdmin, send } from "../_lib/auth.js";

// GET   /api/admin/restaurant — the caller's tenant settings (admin)
// PATCH /api/admin/restaurant — update settings (admin)
export default async function handler(req, res) {
  try {
    const r = await authAdmin(req);
    if (!r) return send(res, 401, { error: "سجّل دخول كإدارة الأول" });

    if (req.method === "GET") {
      return send(res, 200, {
        restaurant: {
          slug: r.slug, name: r.name, tagline: r.tagline, area: r.area,
          whatsappNumber: r.whatsappNumber, logoUrl: r.logoUrl, theme: r.theme,
          categories: r.categories, items: r.items,
        },
      });
    }

    if (req.method === "PATCH") {
      const { name, tagline, area, whatsappNumber, logoUrl, theme } = req.body || {};
      if (name !== undefined) r.name = String(name).trim() || r.name;
      if (tagline !== undefined) r.tagline = String(tagline);
      if (area !== undefined) r.area = String(area);
      if (whatsappNumber !== undefined) r.whatsappNumber = String(whatsappNumber).replace(/\D/g, "");
      if (logoUrl !== undefined) r.logoUrl = String(logoUrl);
      if (theme && typeof theme === "object") {
        for (const k of ["primary", "dark", "light"]) {
          if (typeof theme[k] === "string" && /^#[0-9a-fA-F]{6}$/.test(theme[k])) r.theme[k] = theme[k];
        }
      }
      await r.save();
      return send(res, 200, { ok: true });
    }

    send(res, 405, { error: "Method not allowed" });
  } catch (e) {
    send(res, 500, { error: "حصل خطأ في السيرفر" });
  }
}
