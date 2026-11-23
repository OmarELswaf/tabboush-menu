import React, { useEffect, useState } from "react";
import { api } from "./api";

const egp = (n) => `${n} ج.م`;

export default function MyOrders({ slug, user, onNeedAuth }) {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    api.myOrders(slug)
      .then((d) => setOrders(d.orders))
      .catch((e) => setError(e.message));
  }, [slug, user]);

  if (!user) {
    return (
      <div className="page">
        <h2>طلباتي</h2>
        <p className="modal-sub">سجّل دخولك عشان تشوف طلباتك.</p>
        <button className="primary-btn" onClick={onNeedAuth}>تسجيل الدخول</button>
      </div>
    );
  }

  return (
    <div className="page">
      <h2>طلباتي</h2>
      {error && <p className="form-error">{error}</p>}
      {orders === null && !error && <p className="modal-sub">بتحميل...</p>}
      {orders && orders.length === 0 && <p className="modal-sub">لسه مفيش طلبات — اطلب من المنيو.</p>}
      {orders && orders.map((o) => (
        <div className="order-card" key={o._id}>
          <div className="order-head">
            <strong>طلب #{o._id.slice(-6)}</strong>
            <span className={`status s-${o.status}`}>{o.status}</span>
          </div>
          <p className="order-meta">{new Date(o.createdAt).toLocaleString("ar-EG")} — {o.type}</p>
          <ul className="order-lines">
            {o.items.map((i, k) => <li key={k}>{i.qty}× {i.name} — {egp(i.price * i.qty)}</li>)}
          </ul>
          {o.notes && <p className="order-meta">ملاحظات: {o.notes}</p>}
          <div className="total"><span>الإجمالي</span><strong>{egp(o.total)}</strong></div>
        </div>
      ))}
    </div>
  );
}
