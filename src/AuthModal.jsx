import React, { useState } from "react";
import { api, setSession } from "./api";

export default function AuthModal({ onClose, onDone }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = mode === "login" ? await api.login(form) : await api.signup(form);
      setSession(data.token, data.user);
      onDone(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{mode === "login" ? "تسجيل الدخول" : "حساب جديد"}</h2>
        <p className="modal-sub">{mode === "login" ? "ادخل بحسابك عشان تكمل الطلب" : "سجّل حساب جديد عشان تطلب وتتابع طلباتك"}</p>
        <form onSubmit={submit} className="modal-form">
          {mode === "signup" && <input required placeholder="الاسم" value={form.name} onChange={set("name")} />}
          <input required type="email" placeholder="الإيميل" value={form.email} onChange={set("email")} />
          <input required type="password" placeholder="كلمة السر (6 حروف على الأقل)" value={form.password} onChange={set("password")} />
          {error && <p className="form-error">{error}</p>}
          <button className="primary-btn" disabled={busy}>{busy ? "لحظة..." : mode === "login" ? "دخول" : "تسجيل"}</button>
        </form>
        <button className="link-btn" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
          {mode === "login" ? "معندكش حساب؟ سجّل دلوقتي" : "عندك حساب؟ سجّل دخولك"}
        </button>
      </div>
    </div>
  );
          }
