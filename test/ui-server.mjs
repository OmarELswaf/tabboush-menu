// Starts an in-memory MongoDB, seeds Tabboush, and runs the dev API on :5000.
// Used for local UI verification. Ctrl-C to stop.
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcryptjs";

const mongod = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongod.getUri("tabboush");
process.env.JWT_SECRET = "ui-test-secret";

const { connectDB } = await import("../api/_lib/db.js");
const { Restaurant } = await import("../api/_lib/models.js");
const { DEFAULT_TENANT, DEFAULT_ADMIN_CODE } = await import("../src/defaultTenant.js");
await connectDB();
const { slug, ...data } = DEFAULT_TENANT;
await Restaurant.create({ slug, ...data, adminCodeHash: await bcrypt.hash(DEFAULT_ADMIN_CODE, 10) });
await import("../server/dev.js");
console.log("UI test stack ready — vite dev proxies /api to :5000");
