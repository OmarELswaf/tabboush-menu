import React, { useMemo, useState } from "react";
import { api } from "./api";
import AuthModal from "./AuthModal";

const egp = (n) => `${n} ج.م`;

function IconPlus() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>;
}
function IconMinus() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14"/></svg>;
}
function IconWhatsApp() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.5 14.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07a8.2 8.2 0 0 1-2.4-1.48 9 9 0 0 1-1.66-2.07c-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.1 4.49.71.3 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.76-.72 2-1.42.25-.7.25-1.3.18-1.42-.08-.13-.28-.2-.58-.35ZM12.05 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88a9.83 9.83 0 0 1 9.88 9.9c0 5.44-4.44 9.87-9.89 9.87Zm8.42-18.3A11.82 11.82 0 0 0 12.04 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.14 1.6 5.95L.05 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.18-1.24-6.16-3.46-8.4Z"/></svg>;
}
function IconClose() {
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>;
}
function IconBasket() {
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 11 4-7M19 11l-4-7M2 11h20M3.5 11l1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6L20.5 11M9 14l.5 4M15 14l-.5 4"/></svg>;
}

export default function MenuView({ tenant, user, onAuth, live }) {
  const [activeCat, setActiveCat] = useState(tenant.categories[0]);
  const [cart, setCart] = useState({});
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState({ phone: "", type: "استلام من الفرع", notes: "" });
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [error, setError] = useState("");

  const cartItems = useMemo(
    () => Object.entries(cart).map(([id, qty]) => ({ ...tenant.items.find((i) => i.id === id), qty })).filter((i) => i.qty > 0 && i.name),
    [cart, tenant]
  );
  const total = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cartItems.reduce((s, i) => s + i.qty, 0);
  const add = (id, d) => setCart((c) => ({ ...c, [id]: Math.max(0, (c[id] || 0) + d) }));

  const orderLines = () => [
    `طلب جديد من منيو ${tenant.name}`,
    "────────────",
    ...cartItems.map((i) => `${i.qty}× ${i.name} — ${egp(i.price * i.qty)}`),
    "────────────",
    `الإجمالي: ${egp(total)}`,
    `الاسم: ${user?.name || "—"}`,
    `نوع الطلب: ${form.type}`,
    form.phone ? `موبايل: ${form.phone}` : null,
    form.notes ? `ملاحظات: ${form.notes}` : null,
  ].filter(Boolean);

  const waUrl = `https://wa.me/${tenant.whatsappNumber}?text=${encodeURIComponent(orderLines().join("\n"))}`;

  const placeOrder = async () => {
    if (!user) return setShowAuth(true);
    setPlacing(true);
    setError("");
    try {
      const { order } = await api.placeOrder({
        slug: tenant.slug,
        type: form.type,
        notes: form.notes,
        phone: form.phone,
        items: cartItems.map((i) => ({ itemId: i.id, qty: i.qty })),
      });
      setPlaced(order);
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  };

  const closeAfterOrder = () => {
    setPlaced(null);
    setCart({});
    setDrawer(false);
  };

  return (
    <>
      <header className="hero">
        <div className="hero-badge">
          {tenant.logoUrl ? <img className="hero-logo" src={tenant.logoUrl} alt="" /> : null}
          {tenant.name}
        </div>
        <h1>{tenant.tagline || "أهلاً بيكم"}</h1>
        {tenant.area && <p className="hero-loc">{tenant.area}</p>}
        <a className="hero-cta" href="#menu">استعرض المنيو</a>
      </header>

      <nav className="chips" id="menu">
        {tenant.categories.map((c) => (
          <button key={c} className={c === activeCat ? "chip active" : "chip"} onClick={() => setActiveCat(c)}>{c}</button>
        ))}
      </nav>

      <main className="menu">
        {tenant.items.filter((i) => i.cat === activeCat).map((item) => (
          <article className="card" key={item.id}>
            {item.img && <img src={item.img} alt={item.name} loading="lazy" />}
            <div className="card-body">
              <div className="card-head">
                <h3>{item.name}</h3>
                {item.tag && <span className="tag">{item.tag}</span>}
              </div>
              {item.desc && <p className="desc">{item.desc}</p>}
              <div className="card-foot">
                <span className="price">{egp(item.price)}</span>
                {cart[item.id] ? (
                  <div className="qty">
                    <button aria-label="زيادة" onClick={() => add(item.id, 1)}><IconPlus /></button>
                    <span>{cart[item.id]}</span>
                    <button aria-label="تقليل" onClick={() => add(item.id, -1)}><IconMinus /></button>
                  </div>
                ) : (
                  <button className="add-btn" onClick={() => add(item.id, 1)}><IconPlus /> أضف</button>
                )}
              </div>
            </div>
          </article>
        ))}
      </main>

      {count > 0 && !placed && (
        <button className="cart-bar" onClick={() => setDrawer(true)}>
          <span className="cart-bar-count"><IconBasket /> {count} صنف</span>
          <span>عرض الطلب</span>
          <span className="cart-bar-total">{egp(total)}</span>
        </button>
      )}

      {drawer && !placed && (
        <div className="overlay" onClick={() => setDrawer(false)}>
          <aside className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <h2>طلبك</h2>
              <button className="icon-btn" aria-label="إغلاق" onClick={() => setDrawer(false)}><IconClose /></button>
            </div>
            <div className="drawer-items">
              {cartItems.map((i) => (
                <div className="drawer-item" key={i.id}>
                  {i.img && <img src={i.img} alt="" />}
                  <div className="di-info"><strong>{i.name}</strong><span>{egp(i.price)}</span></div>
                  <div className="qty small">
                    <button aria-label="زيادة" onClick={() => add(i.id, 1)}><IconPlus /></button>
                    <span>{i.qty}</span>
                    <button aria-label="تقليل" onClick={() => add(i.id, -1)}><IconMinus /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="drawer-form">
              <input placeholder="رقم الموبايل (اختياري)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option>استلام من الفرع</option>
                <option>دليفري</option>
                <option>طاولة بالمطعم</option>
              </select>
              <input placeholder="ملاحظات (اختياري)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="drawer-foot">
              <div className="total"><span>الإجمالي</span><strong>{egp(total)}</strong></div>
              {error && <p className="form-error">{error}</p>}
              {live ? (
                <button className="primary-btn full" onClick={placeOrder} disabled={placing || count === 0}>
                  {placing ? "بيتسجل..." : user ? "تأكيد الطلب" : "سجّل دخولك وأطلب"}
                </button>
              ) : (
                <p className="demo-note">وضع العرض الثابت — الطلبات بتشتغل لما السيرفر يكون شغال.</p>
              )}
              <a className="wa-btn" href={waUrl} target="_blank" rel="noopener">
                <IconWhatsApp /> أو ابعت الطلب واتساب مباشرة
              </a>
              <p className="demo-note">رقم الواتساب تجريبي — يُستبدل برقم المطعم عند التشغيل الفعلي.</p>
            </div>
          </aside>
        </div>
      )}

      {placed && (
        <div className="overlay">
          <div className="modal">
            <h2>اتسجل طلبك</h2>
            <p className="modal-sub">رقم الطلب: {placed._id.slice(-6)} — الحالة: {placed.status}</p>
            <p className="modal-sub">تقدر تتابع حالته من صفحة "طلباتي"، أو تبعته للمطعم واتساب:</p>
            <a className="wa-btn" href={waUrl} target="_blank" rel="noopener"><IconWhatsApp /> إرسال نسخة واتساب</a>
            <button className="primary-btn full" style={{ marginTop: 10 }} onClick={closeAfterOrder}>تمام</button>
          </div>
        </div>
      )}

      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onDone={(u) => { setShowAuth(false); onAuth(u); }} />
      )}
    </>
  );
    }
