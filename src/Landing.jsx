import React from "react";

const FEATURES = [
  { icon: "📱", title: "منيو QR فوري", desc: "العميل يصوّر الكود على الترابيزة ويشوف المنيو كامل على موبايله، من غير تحميل أي تطبيق." },
  { icon: "🟢", title: "طلبات على واتساب", desc: "العميل يجمّع طلبه ويبعته لرقم واتساب المطعم مباشرة، برسالة مرتبة فيها كل التفاصيل." },
  { icon: "🛠️", title: "لوحة تحكم سهلة", desc: "عدّل الأصناف والأسعار والصور والألوان في أي وقت، والتغيير يظهر في المنيو فورًا." },
  { icon: "🎨", title: "على ستايل مطعمك", desc: "اسمك ولوجوك وألوانك — المنيو يبان كأنه جزء من براندك مش صفحة جاهزة." },
  { icon: "📦", title: "متابعة الطلبات", desc: "الطلبات بتتسجل وتتقسّم حسب الحالة: جديد، قيد التحضير، جاهز، تم التسليم." },
  { icon: "🇪🇬", title: "مصمم للسوق المصري", desc: "عربي RTL أولًا، أسعار بالجنيه، أنواع طلب: استلام من الفرع أو دليفري أو طاولة." },
];

const STEPS = [
  { n: "١", title: "ابعتلنا منيوك", desc: "صور المنيو الحالي أو ابعت الأصناف والأسعار واتساب، واحنا نجهزهولك." },
  { n: "٢", title: "راجع وعدّل", desc: "تدخل لوحة التحكم وتجرّب بنفسك: غيّر سعر، ضيف صنف، بدّل الألوان." },
  { n: "٣", title: "اطبع الكود واشتغل", desc: "تستلم كود QR جاهز للطباعة على الترابيزات، وتعدّل منيوك من لوحة التحكم في أي وقت." },
];

export default function Landing() {
  return (
    <div className="landing">
      <header className="l-hero">
        <p className="l-kicker">تبّوش — منيو رقمي للمطاعم والكافيهات</p>
        <h1>منيو QR لمطعمك<br />على موبايل عميلك</h1>
        <p className="l-sub">
          عميلك يصوّر الكود، يشوف المنيو بالصور والأسعار، ويطلب على واتساب مباشرة.
          وإنت تعدّل أي حاجة من لوحة تحكم سهلة، من غير مبرمج.
        </p>
        <div className="l-cta-row">
          <a className="l-cta primary" href="/r/tabboush">جرّب الديمو الحي</a>
          <a className="l-cta ghost" href="mailto:alsawaf.3mor@gmail.com?subject=منيو%20QR%20لمطعمي">كلمنا على الإيميل</a>
        </div>
        <p className="l-note">الديمو ببيانات مطعم وهمي (تبّوش) — كل اللي هتشوفه بيشتغل فعلًا.</p>
      </header>

      <section className="l-section">
        <h2>ليه مطعمك محتاج منيو رقمي؟</h2>
        <div className="l-grid">
          {FEATURES.map((f) => (
            <div className="l-feature" key={f.title}>
              <span className="l-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="l-section l-steps-sec">
        <h2>بنشتغل إزاي؟</h2>
        <div className="l-steps">
          {STEPS.map((s) => (
            <div className="l-step" key={s.n}>
              <span className="l-step-n">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="l-section">
        <h2>التسعير</h2>
        <p className="l-note center">السعر بيتحدد حسب حجم المنيو وعدد الفروع واحتياجك. كلمنا ونبعتلك عرض سعر واضح لمطعمك قبل ما تدفع أي حاجة.</p>
        <div className="l-cta-row">
          <a className="l-cta primary" href="mailto:alsawaf.3mor@gmail.com?subject=تسعير%20منيو%20QR">اطلب عرض سعر</a>
        </div>
      </section>

      <section className="l-final">
        <h2>جاهز نشغّل منيو مطعمك؟</h2>
        <p>ابعتلنا اسم المطعم والمنيو الحالي، ونرجعلك بنسخة تجريبية على اسمك.</p>
        <a className="l-cta primary" href="mailto:alsawaf.3mor@gmail.com?subject=منيو%20QR%20لمطعمي&body=اسم%20المطعم%3A%0Aالمنطقة%3A%0Aرقم%20الموبايل%3A">اطلب منيوك دلوقتي</a>
        <p className="l-note">أو جرّب الأول: <a className="link-btn" href="/r/tabboush">منيو تبّوش التجريبي</a> — <a className="link-btn" href="/admin">لوحة التحكم</a> (كود الديمو: tabboush-demo-admin)</p>
      </section>

      <footer className="l-footer">
        <p>تبّوش — منيو رقمي وطلبات واتساب للمطاعم والكافيهات في مصر.</p>
        <p className="l-note">بيانات مطعم "تبّوش" في الديمو وهمية بالكامل لأغراض العرض.</p>
      </footer>
    </div>
  );
}
