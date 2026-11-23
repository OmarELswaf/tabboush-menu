// End-to-end smoke test: in-memory MongoDB + the real serverless handlers.
// Run: node test/e2e.mjs
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcryptjs";

const mongod = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongod.getUri("tabboush");
process.env.JWT_SECRET = "test-secret";
process.env.SEED_KEY = "seed-test-key";

// Seed the sample tenant (same data as server/seed.js).
const { connectDB } = await import("../api/_lib/db.js");
const { Restaurant } = await import("../api/_lib/models.js");
const { DEFAULT_TENANT, DEFAULT_ADMIN_CODE } = await import("../src/defaultTenant.js");
await connectDB();
const { slug, ...data } = DEFAULT_TENANT;
await Restaurant.create({ slug, ...data, adminCodeHash: await bcrypt.hash(DEFAULT_ADMIN_CODE, 10) });

// Start the dev API server (listens on :5000).
await import("../server/dev.js");
await new Promise((r) => setTimeout(r, 500));

const base = "http://localhost:5000";
const j = (r) => r.json();
let failures = 0;
const check = (name, ok, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? " — " + extra : ""}`);
  if (!ok) failures++;
};

// 1. Public tenant config, no secrets.
let r = await fetch(`${base}/api/restaurants/tabboush`);
let d = await j(r);
check("GET tenant config", r.status === 200 && d.restaurant.name === "تبّوش" && d.restaurant.items.length === 15);
check("config hides adminCodeHash", !JSON.stringify(d).includes("adminCodeHash"));

// 2. Customer signup + login.
r = await fetch(`${base}/api/auth/signup`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "عميل تجريبي", email: "demo@example.com", password: "secret123" }) });
d = await j(r);
check("signup", r.status === 201 && d.token, `status ${r.status}`);
const token = d.token;
r = await fetch(`${base}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "demo@example.com", password: "wrong" }) });
check("login rejects wrong password", r.status === 401);
r = await fetch(`${base}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "demo@example.com", password: "secret123" }) });
check("login", r.status === 200);

// 3. Ordering requires auth.
r = await fetch(`${base}/api/orders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: "tabboush", type: "دليفري", items: [{ itemId: "g1", qty: 2 }] }) });
check("order rejected without auth", r.status === 401);

// 4. Place order; server recomputes price from stored menu (client sends no price).
r = await fetch(`${base}/api/orders", `, { method: "POST" });
r = await fetch(`${base}/api/orders`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  body: JSON.stringify({ slug: "tabboush", type: "دليفري", notes: "بدون بصل", items: [{ itemId: "g1", qty: 2, price: 1 }, { itemId: "s1", qty: 1, price: 1 }] }),
});
d = await j(r);
check("place order", r.status === 201 && d.order.total === 320 * 2 + 45, `total ${d.order?.total} (server-side price)`);
const orderId = d.order?._id;

// 5. Order history.
r = await fetch(`${base}/api/orders?slug=tabboush`, { headers: { Authorization: `Bearer ${token}` } });
d = await j(r);
check("my orders", r.status === 200 && d.orders.length === 1 && d.orders[0].status === "جديد");

// 6. Admin login + orders + status.
r = await fetch(`${base}/api/admin/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: "tabboush", code: "wrong" }) });
check("admin login rejects wrong code", r.status === 401);
r = await fetch(`${base}/api/admin/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: "tabboush", code: DEFAULT_ADMIN_CODE }) });
d = await j(r);
check("admin login", r.status === 200 && d.token);
const atok = d.token;

r = await fetch(`${base}/api/admin/orders`, { headers: { Authorization: `Bearer ${atok}` } });
d = await j(r);
check("admin sees order with customer name", r.status === 200 && d.orders.length === 1 && d.orders[0].customerName === "عميل تجريبي");

r = await fetch(`${base}/api/admin/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${atok}` }, body: JSON.stringify({ status: "قيد التحضير" }) });
d = await j(r);
check("status update", r.status === 200 && d.order.status === "قيد التحضير");

// 7. Admin menu + settings edits reflect in public config.
r = await fetch(`${base}/api/admin/menu`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${atok}` }, body: JSON.stringify({ categories: ["المشويات"], items: [{ id: "x1", cat: "المشويات", name: "صنف جديد", price: 99 }] }) });
check("menu replace", r.status === 200);
r = await fetch(`${base}/api/restaurants/tabboush`);
d = await j(r);
check("public config reflects menu edit", d.restaurant.items.length === 1 && d.restaurant.items[0].name === "صنف جديد");

r = await fetch(`${base}/api/admin/restaurant`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${atok}` }, body: JSON.stringify({ whatsappNumber: "+20 100 000 0000", theme: { primary: "#0ea5e9", dark: "nope" } }) });
check("settings patch", r.status === 200);
r = await fetch(`${base}/api/restaurants/tabboush`);
d = await j(r);
check("whatsapp digits-only + valid color applied", d.restaurant.whatsappNumber === "201000000000" && d.restaurant.theme.primary === "#0ea5e9" && d.restaurant.theme.dark === "#15803d", JSON.stringify(d.restaurant.theme));

// 8. Admin routes reject customer tokens.
r = await fetch(`${base}/api/admin/orders`, { headers: { Authorization: `Bearer ${token}` } });
check("customer token rejected from admin", r.status === 401);

// 9. Seed endpoint: wrong key rejected; seeds only into an empty DB.
r = await fetch(`${base}/api/seed`, { method: "POST", headers: { "x-seed-key": "wrong" } });
check("seed rejects wrong key", r.status === 401);
r = await fetch(`${base}/api/seed`, { method: "POST", headers: { "x-seed-key": process.env.SEED_KEY } });
check("seed refuses non-empty DB", r.status === 409, `status ${r.status}`);

console.log(failures === 0 ? "\nALL TESTS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
