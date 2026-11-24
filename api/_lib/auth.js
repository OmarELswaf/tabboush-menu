import jwt from "jsonwebtoken";
import { User, Restaurant } from "./models.js";
import { connectDB } from "./db.js";

const secret = () => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not set");
  return process.env.JWT_SECRET;
};

export function signToken(user) {
  return jwt.sign({ uid: user._id.toString(), name: user.name, email: user.email }, secret(), { expiresIn: "30d" });
}

export function signAdminToken(restaurant) {
  return jwt.sign({ rid: restaurant._id.toString(), slug: restaurant.slug, admin: true }, secret(), { expiresIn: "12h" });
}

// Returns the authenticated customer doc or null.
export async function authUser(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, secret());
    if (payload.admin) return null;
    await connectDB();
    return await User.findById(payload.uid);
  } catch {
    return null;
  }
}

// Returns the restaurant the caller admins, or null.
export async function authAdmin(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, secret());
    if (!payload.admin) return null;
    await connectDB();
    return await Restaurant.findById(payload.rid);
  } catch {
    return null;
  }
}

export function send(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(body));
}

// The public demo tenant is view-only: visitors can tour the admin panel
// but writes are blocked so the shared sample menu stays intact.
export const PUBLIC_DEMO_SLUG = "tabboush";
export const isPublicDemo = (r) => !!r && r.slug === PUBLIC_DEMO_SLUG;
export const DEMO_READONLY_MSG = "دي نسخة عرض للمشاهدة بس — التعديل مقفول في الديمو.";
