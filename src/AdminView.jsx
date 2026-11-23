import React, { useEffect, useState } from "react";
import { api, getAdminToken, setAdminToken } from "./api";

const egp = (n) => `${n} ج.م`;
const STATUSES = ["جديد", "قيد التحضير", "جاهز", "تم التسليم", "ملغي"];

function OrdersTab() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  const load = () => api.adminOrders().then((d) => setOrders(d.orders)).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    try {
      await api.adminSetStatus(id, status);
      setOrders((os) => os.map((o) => (o._id === id ? { ...o, status } : o)));
    } catch (e) {
      setError(e.message);
    }
  };

  if (error) return <p className="form-error">{error}</p>;
  if (orders === null) return <p className="modal-sub">بتحميل...</p>;
  if (orders.length === 0) return <p className="modal-sub">مفيش طلبات لسه.</p>;
  return (
    <div className="admin-list">
      {orders.map((o) => (
        <div className="order-card" key={o._id}>
          <div className="order-head">
            <strong>#{o._id.slice(-6)} — {o.customerName}</strong>
            <span className={`status s-${o.status}`}>{o.status}</span>
          </div>
          <p className="order-meta">
            {new Date(o.createdAt).toLocaleString("ar-EG")} — {o.type}
            {o.phone ? ` — ${o.phone}` : ""}
          </p>
          <ul className="order-lines">
            {o.items.map((i, k) => <li key={k}>{i.qty}× {i.name} — {egp(i.price * i.qty)}</li>)}
          </ul>
          {o.notes && <p className="order-meta">ملاحظات: {o.notes}</p>}
          <div className="order-foot">
            <strong>{egp(o.total)}</strong>
            <select value={o.status} onChange={(e) => setStatus(o._id, e.target.value)}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      ))}
      <button className="link-btn" onClick={load}>تحديث</button>
    </div>
  );
}

function MenuTab() {
  const [data, setData] = useState(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.adminRestaurant()
      .then((d) => setData({ categories: [...d.restaurant.categories], items: d.restaurant.items.map((i) => ({ ...i })) }))
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="form-error">{error}</p>;
  if (!data) return <p className="modal-sub">بتحميل...</p>;

  const setItem = (idx, k, v) => {
    const items = [...data.items];
    items[idx] = { ...items[idx], [k]: k === "price" ? Number(v) : v };
    setData({ ...data, items });
  };

  const save = async () => {
    setMsg("");
    setError("");
    try {
      await api.adminSaveMenu(data);
      setMsg("اتحفظ المنيو — المنيو العام اتحدث فورًا.");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="admin-list">
      <div className="admin-row">
        <input
          placeholder="قسم جديد"
          value={data.newCat || ""}
          onChange={(e) => setData({ ...data, newCat: e.target.value })}
        />
        <button
          className="small-btn"
          onClick={() => {
            const c = (data.newCat || "").trim();
            if (c && !data.categories.includes(c)) setData({ ...data, categories: [...data.categories, c], newCat: "" });
          }}
        >أضف قسم</button>
      </div>
      <div className="cat-pills">
        {data.categories.map((c) => (
          <span className="tag" key={c}>
            {c}
            <button className="x" onClick={() => setData({ ...data, categories: data.categories.filter((x) => x !== c), items: data.items.filter((i) => i.cat !== c) })}>×</button>
          </span>
        ))}
      </div>

      {data.items.map((item, idx) => (
        <div className="item-editor" key={item.id || idx}>
          <div className="admin-row">
            <input placeholder="اسم الصنف" value={item.name} onChange={(e) => setItem(idx, "name", e.target.value)} />
            <input className="num" type="number" min="0" placeholder="السعر" value={item.price} onChange={(e) => setItem(idx, "price", e.target.value)} />
          </div>
          <div className="admin-row">
            <select value={item.cat} onChange={(e) => setItem(idx, "cat", e.target.value)}>
              {data.categories.map((c) => <option key={c}>{c}</option>)}
            </select>
            <input placeholder="وسام (اختياري)" value={item.tag || ""} onChange={(e) => setItem(idx, "tag", e.target.value)} />
          </div>
          <input placeholder="الوصف" value={item.desc || ""} onChange={(e) => setItem(idx, "desc", e.target.value)} />
          <input placeholder="رابط الصورة" value={item.img || ""} onChange={(e) => setItem(idx, "img", e.target.value)} />
          <button className="link-btn danger" onClick={() => setData({ ...data, items: data.items.filter((_, k) => k !== idx) })}>حذف الصنف</button>
        </div>
      ))}

      <button
        className="small-btn"
        onClick={() => setData({ ...data, items: [...data.items, { id: `i${Date.now()}`, cat: data.categories[0] || "", name: "", desc: "", price: 0, img: "", tag: "" }] })}
      >أضف صنف</button>

      {msg && <p className="ok-note">{msg}</p>}
      {error && <p className="form-error">{error}</p>}
      <button className="primary-btn full" onClick={save}>حفظ المنيو</button>
    </div>
  );
}

function SettingsTab({ onSaved }) {
  const [form, setForm] = useState(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.adminRestaurant()
      .then((d) => {
        const r = d.restaurant;
        setForm({ name: r.name, tagline: r.tagline, area: r.area, whatsappNumber: r.whatsappNumber, logoUrl: r.logoUrl, theme: { ...r.theme } });
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="form-error">{error}</p>;
  if (!form) return <p className="modal-sub">بتحميل...</p>;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setColor = (k) => (e) => setForm({ ...form, theme: { ...form.theme, [k]: e.target.value } });

  const save = async () => {
    setMsg("");
    setError("");
    try {
      await api.adminSaveSettings(form);
      setMsg("اتحفظت الإعدادات — شغالة فورًا على المنيو العام.");
      onSaved();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="admin-list">
      <label className="field">اسم المطعم<input value={form.name} onChange={set("name")} /></label>
      <label className="field">الجملة التعريفية<input value={form.tagline} onChange={set("tagline")} /></label>
      <label className="field">المنطقة<input value={form.area} onChange={set("area")} /></label>
      <label className="field">رقم واتساب (بكود الدولة، بدون +)<input dir="ltr" value={form.whatsappNumber} onChange={set("whatsappNumber")} /></label>
      <label className="field">رابط اللوجو (اختياري)<input dir="ltr" value={form.logoUrl} onChange={set("logoUrl")} /></label>
      <div className="colors-row">
        <label className="field color">اللون الأساسي<input type="color" value={form.theme.primary} onChange={setColor("primary")} /></label>
        <label className="field color">الغامق<input type="color" value={form.theme.dark} onChange={setColor("dark")} /></label>
        <label className="field color">الفاتح<input type="color" value={form.theme.light} onChange={setColor("light")} /></label>
      </div>
      {msg && <p className="ok-note">{msg}</p>}
      {error && <p className="form-error">{error}</p>}
      <button className="primary-btn full" onClick={save}>حفظ الإعدادات</button>
    </div>
  );
}

export default function AdminView() {
  const [authed, setAuthed] = useState(!!getAdminToken());
  const [login, setLogin] = useState({ slug: "", code: "" });
  const [tab, setTab] = useState("orders");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const doLogin = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const d = await api.adminLogin(login);
      setAdminToken(d.token);
      setAuthed(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="app admin-app">
      <div className="demo-ribbon">لوحة تحكم تجريبية — بيانات للعرض فقط</div>
      <div className="page">
        <div className="admin-top">
          <h2>لوحة تحكم المطعم</h2>
          <a className="link-btn" href="/">رجوع للمنيو</a>
        </div>

        {!authed ? (
          <form onSubmit={doLogin} className="modal-form">
            <input required placeholder="اسم المطعم (slug) — مثال: tabboush" dir="ltr" value={login.slug} onChange={(e) => setLogin({ ...login, slug: e.target.value })} />
            <input required type="password" placeholder="كود الإدارة" value={login.code} onChange={(e) => setLogin({ ...login, code: e.target.value })} />
            {error && <p className="form-error">{error}</p>}
            <button className="primary-btn" disabled={busy}>{busy ? "لحظة..." : "دخول"}</button>
            <p className="demo-note">في الديمو: slug = tabboush والكود tabboush-demo-admin</p>
          </form>
        ) : (
          <>
            <div className="tabs">
              <button className={tab === "orders" ? "tab active" : "tab"} onClick={() => setTab("orders")}>الطلبات</button>
              <button className={tab === "menu" ? "tab active" : "tab"} onClick={() => setTab("menu")}>المنيو</button>
              <button className={tab === "settings" ? "tab active" : "tab"} onClick={() => setTab("settings")}>الإعدادات</button>
            </div>
            {tab === "orders" && <OrdersTab />}
            {tab === "menu" && <MenuTab />}
            {tab === "settings" && <SettingsTab onSaved={() => {}} />}
            <button className="link-btn" style={{ marginTop: 16 }} onClick={() => { setAdminToken(null); setAuthed(false); }}>تسجيل خروج</button>
          </>
        )}
      </div>
    </div>
  );
                                                                                                                                                 }
