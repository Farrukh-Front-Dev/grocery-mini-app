# Loyihadagi kamchiliklar va muammolar

## 🔴 CRITICAL (3)

| # | Muammo | Fayl | Tafsilot |
|---|--------|------|----------|
| 1 | **Transaction yo'q** — buyurtma yaratishda order va stock decrement alohida, server ketsa order bor stock kamaymagan qoladi | `backend/src/routes/orders.ts:82-107` | Overselling xavfi, PROMPT'da "no oversold stock" deyilgan |
| 2 | **Transaction yo'q** — bekor qilishda stock restore xuddi shunday muammo | `backend/src/routes/orders.ts:133-142` | Server ketsa stock tiklanmasdan qoladi |
| 3 | **Dev mode auth`ni chetlab o'tadi** — `DEV_MODE=true` da hamma request'lar admin sifatida o'tadi | `backend/src/middleware/auth.ts:105-112` | Tasodifan production'da qolib ketsa, API butunlay himoyasiz |

## 🟠 HIGH (10)

| # | Muammo | Fayl | Tafsilot |
|---|--------|------|----------|
| 1 | **Telegram location sharing yo'q** — faqat manual address input bor, Telegram'ning built-in location pickeri yo'q | `frontend/src/pages/customer/Cart.tsx:152-157` | PROMPT talabi |
| 2 | **Narx/stock o'zgarganida checkout'da ogohlantirish yo'q** — server rad etganda generic xato chiqadi | `frontend/src/pages/customer/Cart.tsx:50-65` | User nima bo'lganini tushunmaydi |
| 3 | **"Yangi" statusdan cancel qilib bo'lmaydi** — faqat "tayyorlanmoqda" dan cancel bor | `frontend/src/pages/admin/AdminOrders.tsx:112-127` | Admin bevosita rad eta olmaydi |
| 4 | **Category management UI yo'q** — faqat product CRUD bor, category qo'shish/o'chirish yo'q | `frontend/src/pages/admin/AdminProducts.tsx` | PROMPT talabi |
| 5 | **Password Hashing zaif** — single SHA-256, salt yo'q | `backend/src/routes/auth.ts:11-13` | DB o'g'irlansa parollar ochiladi |
| 6 | **Token generation zaif** — `Math.random()` ishlatilgan, `crypto.randomBytes()` kerak | `backend/src/routes/auth.ts:15-18` | Token'lar bashorat qilish mumkin |
| 7 | **Step validation yo'q serverda** — zakaz qilganda `step` ga rioya qilish tekshirilmaydi | `backend/src/routes/orders.ts:54-77` | 0.3 kg buyurtma qilish mumkin, step=0.5 bo'lsa ham |
| 8 | **PATCH /products/:id validation yo'q** — Zod schema ishlatilmagan, negative price saqlash mumkin | `backend/src/routes/products.ts:52-62` | Data integrity buzilishi mumkin |
| 9 | **Stock decrement order creation'dan KEYIN** — avval stock kamayib, keyin order yaratilishi kerak | `backend/src/routes/orders.ts:82-107` | Order bor, stock kamaymagan holat |
| 10 | **isActive toggle yo'q admin UI'da** — product'ni faqat o'chirish mumkin, yashirish mumkin emas | `frontend/src/pages/admin/AdminProducts.tsx` | Ma'lumot yo'qoladi |

## 🟡 MEDIUM (15+)

| # | Muammo | Fayl | Tafsilot |
|---|--------|------|----------|
| 1 | **Telefon raqam yig'ilmaydi** — registration form'da telefon so'ralmaydi | `frontend/src/pages/auth/Register.tsx` | PROMPT modelida `phone` bor |
| 2 | **Yetkazib berish narxi hardcoded 0** — delivery fee sozlamasi yo'q | `backend/src/routes/orders.ts:79` | Bepul yetkazish majburiy |
| 3 | **Expense edit/delete yo'q** — xarajatni tahrirlash yoki o'chirish endpointi yo'q | `backend/src/routes/expenses.ts` | Xato kiritilgan expense'ni to'g'irlab bo'lmaydi |
| 4 | **Bot mijoz savollarini adminga yubormaydi** — faqat new order notification bor | `backend/src/bot/index.ts` | PROMPT talabi |
| 5 | **auth_date tekshirilmaydi** — initData HMAC validatsiyasida auth_date (replay attack) tekshirilmaydi | `backend/src/middleware/auth.ts:17-44` | Telegram tavsiyasi |
| 6 | **Rate limiting yo'q** — login/register endpointlarida | `backend/src/routes/auth.ts` | Brute-force mumkin |
| 7 | **Step validation yo'q cart'ga qo'shganda** | `backend/src/routes/cart.ts:17-44` | Noto'g'ri quantity saqlash mumkin |
| 8 | **Product existence check yo'q cart'da** | `backend/src/routes/cart.ts:17-23` | Eski product'lar cart'da qolishi mumkin |
| 9 | **Admin`da mijoz ma'lumoti ko'rinmaydi** — order detail'da mijoz ismi/telefoni yo'q | `frontend/src/pages/admin/AdminOrders.tsx:85-132` | Admin mijozga qo'ng'iroq qila olmaydi |
| 10 | **Per-item stock warning yo'q cart'da** — Products'da "faqat 2kg qoldi" deyiladi, Cart'da yo'q | `frontend/src/pages/customer/Cart.tsx:77-106` | User checkout'da biladi |
| 11 | **catch (e: any)** — 17+ joyda `any` ishlatilgan | Frontend bo'ylab | Type safety buzilgan |
| 12 | **alert()** — 3+ joyda native alert ishlatilgan | `AdminProducts.tsx`, `AdminOrders.tsx`, `AdminFinance.tsx` | UX yomon |
| 13 | **Network error handling** — `fetch` dagi network error ushlanmaydi | `frontend/src/services/api.ts:57-59` | Unhandled rejection |
| 14 | **Logout yo'q** — 401 kelganda user redirect qilinmaydi | `frontend/src/services/api.ts` | Stale token bilan qoladi |
| 15 | **CORS cheklanmagan** — `app.use(cors())` with no options | `backend/src/index.ts:23` | Production'da domain cheklash kerak |
| 16 | **Admin status** — Telegram auth'da `config.ADMIN_IDS` ishlatiladi, DB `is_admin` emas | `backend/src/middleware/auth.ts:79` | Admin faqat env orqali |

## 🔵 LOW (15+)

| # | Muammo | Fayl | Tafsilot |
|---|--------|------|----------|
| 1 | **Order items JSON text'da** — har safar `JSON.parse()`/`JSON.stringify()` qilinadi, type safety yo'q | `backend/src/routes/orders.ts` bo'ylab | |
| 2 | **Unused imports** — `@twa-dev/sdk`, `@tanstack/react-query`, `@grammyjs/web-app` | `frontend/package.json`, `backend/package.json` | Bundle bloat |
| 3 | **`as any` Badge variant'da** — 3 joyda type cast | `History.tsx:78`, `AdminOrders.tsx:75`, `AdminHistory.tsx:74` | |
| 4 | **Order item map'da `(item: any)`** — `OrderItem` type'ini ishlatish kerak | `History.tsx:91`, `AdminOrders.tsx:93` | |
| 5 | **ProductCard'da static emoji 🥦** — hamma product bir xil emoji bilan | `frontend/src/pages/customer/Products.tsx:93` | |
| 6 | **Delivery location required** — naqd to'lovda ham majburiy | `frontend/src/pages/customer/Cart.tsx:165` | |
| 7 | **Loading spinner har 8 sekundda** — polling loading'ni true qiladi, ekran miltillaydi | `frontend/src/pages/customer/History.tsx:19` | |
| 8 | **Unit type assertion** — `as "kg"` ishlatilgan, runtime'da boshqa unit bo'lishi mumkin | `frontend/src/pages/admin/AdminProducts.tsx:51,152` | |
| 9 | **Seed .js extension** — `.ts` fileda `.js` import ishlatilgan | `backend/src/seed.ts:3-4` | |
| 10 | **Confirm yo'q checkout'da** — bir tugma bilan buyurtma ketadi | `frontend/src/pages/customer/Cart.tsx:165` | |
| 11 | **No all-categories view** — mahsulotlarni hamma kategoriyada ko'rib bo'lmaydi | `frontend/src/pages/customer/Products.tsx:28` | |
| 12 | **Floating-point subtotal** — `price (int) * quantity (real)` kasr son berishi mumkin | `backend/src/routes/orders.ts:74-75` | |
| 13 | **CartItemId unused** — `CartProduct` interface'ida `cartItemId` hech qayerda ishlatilmaydi | `frontend/src/pages/customer/Cart.tsx:17-20` | |
| 14 | **Hardcoded credentials** — "admin/admin" va "user/user" kod ichida | `backend/src/routes/auth.ts:40-63` | |
| 15 | **No optimistic locking** — stock check va decrement orasida race condition | `backend/src/routes/orders.ts:54-77,97-107` | |

---

## Xulosa

- **Jami kamchiliklar:** ~45+
- **Critical:** 3 ta (transaction, dev mode auth bypass)
- **High:** 10 ta (location sharing, validation, security, UI)
- **Medium:** 16+ ta
- **Low:** 15+ ta
