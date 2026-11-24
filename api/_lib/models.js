import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

const menuItemSchema = new mongoose.Schema(
  {
    id: String,
    cat: String,
    name: String,
    desc: { type: String, default: "" },
    price: Number,
    img: { type: String, default: "" },
    tag: { type: String, default: "" },
    flags: { type: [String], default: [] },
  },
  { _id: false }
);

const restaurantSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    tagline: { type: String, default: "" },
    area: { type: String, default: "" },
    hours: { type: String, default: "" },
    whatsappNumber: { type: String, default: "" },
    logoUrl: { type: String, default: "" },
    theme: {
      primary: { type: String, default: "#16a34a" },
      dark: { type: String, default: "#15803d" },
      light: { type: String, default: "#dcfce7" },
    },
    adminCodeHash: { type: String, required: true },
    categories: { type: [String], default: [] },
    items: { type: [menuItemSchema], default: [] },
  },
  { timestamps: true }
);

const orderItemSchema = new mongoose.Schema(
  {
    itemId: String,
    name: String,
    price: Number,
    qty: Number,
  },
  { _id: false }
);

export const ORDER_STATUSES = ["جديد", "قيد التحضير", "جاهز", "تم التسليم", "ملغي"];

const orderSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customerName: { type: String, required: true },
    phone: { type: String, default: "" },
    type: { type: String, enum: ["استلام من الفرع", "دليفري", "طاولة بالمطعم"], required: true },
    notes: { type: String, default: "" },
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true },
    status: { type: String, enum: ORDER_STATUSES, default: "جديد" },
  },
  { timestamps: true }
);

// Guard against model re-compilation across hot reloads / serverless invocations.
export const User = mongoose.models.User || mongoose.model("User", userSchema);
export const Restaurant = mongoose.models.Restaurant || mongoose.model("Restaurant", restaurantSchema);
export const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
