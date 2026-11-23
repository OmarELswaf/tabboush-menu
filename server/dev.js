// Local dev API server: mounts the Vercel serverless handlers so `npm run dev:api`
// mirrors production routing. Vite proxies /api to this (see vite.config.js).
import express from "express";
import signup from "../api/auth/signup.js";
import login from "../api/auth/login.js";
import adminLogin from "../api/admin/login.js";
import adminRestaurant from "../api/admin/restaurant.js";
import adminMenu from "../api/admin/menu.js";
import adminOrders from "../api/admin/orders.js";
import adminOrderById from "../api/admin/orders/[id].js";
import restaurantBySlug from "../api/restaurants/[slug].js";
import seed from "../api/seed.js";
import orders from "../api/orders/index.js";

const app = express();
app.use(express.json());

const wrap = (handler, mapParams) => async (req, res) => {
  try {
    if (mapParams) req.query = { ...req.query, ...mapParams(req) };
    await handler(req, res);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) res.status(500).json({ error: "حصل خطأ في السيرفر" });
  }
};

app.post("/api/seed", wrap(seed));
app.post("/api/auth/signup", wrap(signup));
app.post("/api/auth/login", wrap(login));
app.post("/api/admin/login", wrap(adminLogin));
app.use("/api/admin/restaurant", wrap(adminRestaurant));
app.put("/api/admin/menu", wrap(adminMenu));
app.get("/api/admin/orders", wrap(adminOrders));
app.patch("/api/admin/orders/:id", wrap(adminOrderById, (req) => ({ id: req.params.id })));
app.get("/api/restaurants/:slug", wrap(restaurantBySlug, (req) => ({ slug: req.params.slug })));
app.use("/api/orders", wrap(orders));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API dev server on http://localhost:${port}`));
