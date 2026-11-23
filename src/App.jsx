import React, { useEffect, useState } from "react";
import { api, getUser, setSession } from "./api";
import { DEFAULT_TENANT } from "./defaultTenant";
import MenuView from "./MenuView";
import MyOrders from "./MyOrders";
import AuthModal from "./AuthModal";
import AdminView from "./AdminView";

function useSlug() {
  const path = window.location.pathname;
  const m = path.match(/^\/r\/([a-z0-9-]+)/);
  if (m) return m[1];
  if (path !== "/") return DEFAULT_TENANT.slug;
  // Root redirects to the sample tenant so the URL is always shareable.
  window.history.replaceState(null, "", `/r/${DEFAULT_TENANT.slug}`);
  return DEFAULT_TENANT.slug;
}

export default function App() {
  const isAdmin = window.location.pathname.startsWith("/admin");
  const slug = useSlug();
  const [tenant, setTenant] = useState(null);
  const [live, setLive] = useState(true);
  const [user, setUser] = useState(getUser());
  const [view, setView] = useState("menu");
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (isAdmin) return;
    api.restaurant(slug)
      .then((d) => { setTenant(d.restaurant); setLive(true); })
      .catch(() => { setTenant(DEFAULT_TENANT); setLive(false); });
  }, [slug, isAdmin]);

  if (isAdmin) return <AdminView />;

  if (!tenant) {
    return <div className="app loading"><div className="demo-ribbon">منيو تجريبي — بيانات وأسعار للعرض فقط</div><p className="loading-text">بتحميل المنيو...</p></div>;
  }

  const t = tenant.theme || {};
  const themeVars = { "--green": t.primary, "--green-dark": t.dark, "--green-light": t.light };

  return (
    <div className="app" style={themeVars}>
      <div className="demo-ribbon">منيو تجريبي — الأصناف والأسعار للعرض فقط وليست بيانات المطعم الحقيقي</div>

      <nav className="topnav">
        <button className={view === "menu" ? "tn-link active" : "tn-link"} onClick={() => setView("menu")}>المنيو</button>
        <button className={view === "orders" ? "tn-link active" : "tn-link"} onClick={() => setView("orders")}>طلباتي</button>
        {user ? (
          <button className="tn-link" onClick={() => { setSession(null, null); setUser(null); }}>خروج ({user.name})</button>
        ) : (
          <button className="tn-link" onClick={() => setShowAuth(true)}>دخول</button>
        )}
      </nav>

      {view === "menu" ? (
        <MenuView tenant={tenant} user={user} live={live} onAuth={setUser} />
      ) : (
        <MyOrders slug={tenant.slug} user={user} onNeedAuth={() => setShowAuth(true)} />
      )}

      <footer className="footer">
        <p><strong>{tenant.name}</strong>{tenant.area ? ` — ${tenant.area}` : ""}</p>
        <p className="demo-note">منيو رقمي تجريبي لأغراض العرض. الصور من Unsplash، والأسعار عشوائية للتوضيح فقط.</p>
        <p className="demo-note"><a className="link-btn" href="/admin">دخول إدارة المطعم</a></p>
      </footer>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onDone={(u) => { setShowAuth(false); setUser(u); }} />}
    </div>
  );
    }
