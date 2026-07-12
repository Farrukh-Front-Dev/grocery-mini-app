# Loyihadagi kamchiliklar va muammolar (yangilangan)

## ✅ FIX QILINGANLAR

### 🔴 Critical (3/3)
1. ✅ Transaction — order creation + stock decrement atomic
2. ✅ Transaction — cancellation stock restore atomic
3. ✅ Dev mode auth — `NODE_ENV !== "production"` sharti bilan cheklandi

### 🟠 High (10/10)
1. ✅ Telegram location sharing — tugma qo'shildi (Telegram WebApp sendData)
2. ✅ Stock warning cart'da — "Faqat X kg qoldi" ko'rsatiladi
3. ✅ "Yangi" statusdan cancel — endi "yangi" va "tayyorlanmoqda" dan cancel mumkin
4. ✅ Category management — backend API + frontend UI qo'shildi
5. ✅ Password hashing — SHA-256 → bcrypt (12 rounds)
6. ✅ Token generation — `Math.random()` → `crypto.randomBytes(32)`
7. ✅ Step validation — serverda order va cart'da tekshiriladi
8. ✅ PATCH /products/:id — Zod schema validatsiyasi
9. ✅ Stock decrement ordering — avval stock, keyin order
10. ✅ isActive toggle — admin product'ni yashirish/ko'rsatish

### 🟡 Medium (mostly fixed)
1. ✅ Telefon raqam — registration form'ga qo'shildi
2. ✅ Expense edit/delete — backend endpointlari qo'shildi
3. ✅ Bot forward messages — mijoz xabarlari adminga yuboriladi
4. ✅ auth_date validation — initData'da 24 soatdan eski bo'lsa reject
5. ✅ Rate limiting — login endpoint'da IP-based limiter
6. ✅ Step validation cart'da — qo'shildi
7. ✅ Product existence check cart'da — qo'shildi
8. ✅ Customer info in admin — order detail'da mijoz ID ko'rsatiladi
9. ✅ Stock warning cart'da — "Faqat X qoldi" qo'shildi
10. ✅ catch(e: any) → catch(e: unknown) — frontend bo'ylab
11. ✅ alert() → in-component error — hamma joyda tuzatildi
12. ✅ CORS — domain cheklash qo'shildi
13. ✅ CreatedAt literal string — explicit `new Date().toISOString()`

### 🔵 Low (partially fixed)
1. ✅ Static emoji 🥦 — endi product image ko'rsatiladi
2. ✅ Loading flicker — polling loading'ni true qilmaydi
3. ✅ Unit type assertion — `as "kg"` o'rniga `form.unit as "kg" | "litr" | "dona"`
4. ✅ Floating-point subtotal — `Math.round()` ishlatiladi
5. ✅ Hardcoded credentials — seed'ga ko'chirildi, runtime'dan olib tashlandi

---

## ⏳ HALI QOLGAN KAMCHILIKLAR

| # | Muammo | Priority | Tafsilot |
|---|--------|----------|----------|
| 1 | **Delivery fee hardcoded 0** | 🟡 Medium | `deliveryFee = 0` hamma joyda, konfiguratsiya yo'q |
| 2 | **No user profile endpoint** | 🟡 Medium | User o'z ma'lumotini ko'ra olmaydi, o'zgartira olmaydi |
| 3 | **Order items JSON text** | 🟡 Medium | `JSON.parse()`/`JSON.stringify()` type safety yo'q |
| 4 | **No optimistic locking** | 🟡 Medium | race condition stock'da (kam ehtimolli) |
| 5 | **Unused packages** | 🔵 Low | `@twa-dev/sdk`, `@tanstack/react-query`, `@grammyjs/web-app` |
| 6 | **`as any` Badge variant** | 🔵 Low | 3 joyda type cast ishlatilgan |
| 7 | **`OrderItem` type** | 🔵 Low | item: any o'rniga OrderItem ishlatish kerak |
| 8 | **Delivery location required** | 🔵 Low | Naqd to'lovda ham address majburiy |
| 9 | **No all-categories view** | 🔵 Low | Hamma product'ni bir joyda ko'rib bo'lmaydi |
| 10 | **CartItemId unused** | 🔵 Low | CartProduct'da cartItemId hech ishlatilmaydi |
| 11 | **No logout on 401** | 🔵 Low | Token eskirsa user redirect qilinmaydi |
| 12 | **Seed .js extension** | 🔵 Low | `.ts` fileda `.js` import |
| 13 | **Admin status** | 🔵 Low | Telegram auth'da DB `is_admin` emas, env `ADMIN_IDS` |
| 14 | **No price-change warning** | 🔵 Low | Narx o'zgarsa checkout'da bildirish yo'q |

---

## Xulosa

- **Fiks qilingan:** ~35 ta kamchilik
- **Hali qolgan:** ~14 ta (asosan low priority)

Loyiha **90-95%** tayyor, ishlab turibdi. Qolganlari mayda polish ishlari.
