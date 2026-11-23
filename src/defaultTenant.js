// The sample tenant (Tabboush) — used to seed the database and as a static
// fallback when the API is unreachable, so the demo always renders.
// بيانات تجريبية بالكامل — أصناف وأسعار للعرض فقط.
const img = (id) => `https://images.unsplash.com/photo-${id}?w=600&q=80`;

export const DEFAULT_TENANT = {
  slug: "tabboush",
  name: "تبّوش",
  tagline: "مشويات وأكل مصري على أصوله",
  area: "شبين القناطر، القليوبية",
  // Clearly fictional demo number — replace with the restaurant's real WhatsApp number.
  whatsappNumber: "201000000000",
  logoUrl: "",
  theme: { primary: "#16a34a", dark: "#15803d", light: "#dcfce7" },
  categories: ["المشويات", "الطواجن والفراخ", "الأرز", "السلطات", "المشروبات", "الحلويات"],
  items: [
    { id: "g1", cat: "المشويات", name: "مشاوي مشكلة", desc: "تشكيلة كفتة وشيش وريش على الفحم مع أرز وخبز", price: 320, img: img("1555939594-58d7cb561ad1"), tag: "الأكثر طلبًا" },
    { id: "g2", cat: "المشويات", name: "كفتة على الفحم", desc: "كفتة بلدي متبلة تتشوح على فحم طبيعي", price: 185, img: img("1599487488170-d11ec9c172f0") },
    { id: "g3", cat: "المشويات", name: "ريش ضأن", desc: "ريش ضأن طرية بتتبيلة الثوم والروزماري", price: 260, img: img("1544025162-d76694265947") },
    { id: "g4", cat: "المشويات", name: "شاورما فراخ", desc: "شاورما فراخ متبلة مع ثومية وعيش سوري", price: 95, img: img("1529006557810-274b9b2fc783") },
    { id: "g5", cat: "المشويات", name: "ستيك بالبطاطس", desc: "ستيك بقري مشوي مع بطاطس وصوص الفلفل", price: 240, img: img("1600891964092-4316c288032e") },
    { id: "t1", cat: "الطواجن والفراخ", name: "فراخ بروست", desc: "قطع فراخ مقرمشة مع بطاطس وصوص الثوم", price: 145, img: img("1626082927389-6cd097cdc6ec") },
    { id: "t2", cat: "الطواجن والفراخ", name: "طاجن مكرونة باللحمة", desc: "مكرونة فرن باللحمة المفرومة والبشاميل", price: 110, img: img("1631452180519-c014fe946bc7") },
    { id: "t3", cat: "الطواجن والفراخ", name: "طاجن خضار", desc: "خضار سوتيه بالفرن على الطريقة البلدي", price: 85, img: img("1541518763669-27fef04b14ea") },
    { id: "r1", cat: "الأرز", name: "أرز بالمأكولات البحرية", desc: "أرز بالجمبري والكاليماري ببهارات البحر", price: 160, img: img("1512058564366-18510be2db19") },
    { id: "s1", cat: "السلطات", name: "سلطة خضراء", desc: "خضروات طازجة بزيت الزيتون والليمون", price: 45, img: img("1540189549336-e6e99c3679fe") },
    { id: "d1", cat: "المشروبات", name: "موكتيل تبّوش", desc: "موكتيل الفواكه الخاص بالبيت — منعش", price: 60, img: img("1544145945-f90425340c7e"), tag: "جديد" },
    { id: "d2", cat: "المشروبات", name: "ميلك شيك", desc: "ميلك شيك شوكولاتة أو فانيليا", price: 55, img: img("1572490122747-3968b75cc699") },
    { id: "d3", cat: "المشروبات", name: "آيس كوفي", desc: "قهوة مثلجة بالحليب والكراميل", price: 50, img: img("1577805947697-89e18249d767") },
    { id: "w1", cat: "الحلويات", name: "براوني بالكراميل", desc: "براوني ساخن مع صوص كراميل وآيس كريم", price: 70, img: img("1551024506-0bccd828d307") },
    { id: "w2", cat: "الحلويات", name: "كيك التوت", desc: "طبقات كيك بالتوت الطازج والكريمة", price: 65, img: img("1565958011703-44f9829ba187") },
  ],
};

// Admin code for the sample tenant, set at seed time. Intentionally public so
// portfolio visitors can try the admin panel on the live demo.
export const DEFAULT_ADMIN_CODE = "tabboush-demo-admin";
