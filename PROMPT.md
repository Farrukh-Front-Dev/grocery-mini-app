# Prompt: Telegram Mini App — Grocery Ordering System (v2)

Copy everything below into your AI coding tool (Claude Code, Cursor, etc.) as the project brief.

---

## Project overview

Build a Telegram Mini App for an online grocery/food ordering business (vegetables, and other food products, sold by weight/volume — kg or liters). The system has **two separate interfaces** launched from the same Telegram bot:

1. **Customer Mini App** — browse products, build a cart, checkout, track orders
2. **Admin Mini App** — manage products, process orders, track income/expenses

The bot itself handles: launching the correct Mini App, forwarding customer text questions to the admin, and pushing notifications (new order → admin, status change → customer) even when the Mini App isn't open. There is no AI or automated decision-making anywhere in this app — all customer questions are answered manually by human admins, and every order/status decision is made by an admin, not by the system.

## Tech stack

- **Frontend (Mini App):** Telegram WebApp SDK, React (or plain HTML/JS/CSS if simpler), bottom tab navigation (like YouTube's tab bar)
- **Backend:** Python with `aiogram` (bot) + `FastAPI` (API for the Mini App)
- **Database:** PostgreSQL (or SQLite for MVP/testing)
- **Hosting:** VPS (specify if you already have one)
- **Currency:** all amounts in so'm (UZS), whole numbers — no decimal currency subunits

If you'd prefer Node.js instead of Python, say so up front — the structure below stays the same either way.

## Security (required, not optional)

- Every request from the Mini App must be authenticated server-side by validating Telegram's `initData` (HMAC-SHA256 signature using the bot token). **Never trust a `telegram_id` sent as a plain request parameter** — it can be spoofed by anyone calling the API directly.
- Check admin status against the *validated* ID on every admin-only endpoint — not just on which UI loads. A customer who inspects network requests should not be able to reach admin routes.
- **Recalculate order totals server-side** from current database prices at the moment of order creation. Never trust a total sent from the client — that's how a business gets underpaid.

## User roles

- **Customer** — any user who opens the bot; sees the customer Mini App
- **Admin** — identified by Telegram user ID, verified via validated `initData` (see Security) on every request

## Data models

```
Category: id, name, icon/emoji, sort_order
Product: id, category_id, name, price (so'm), unit (kg/litr/dona),
         step (min. increment, e.g. 0.5 for kg, 1 for dona),
         image, stock_qty (numeric), is_active (bool)
Cart: user_id, items[{product_id, quantity}]
Order: id, user_id, items[{product_id, quantity, price_at_order}],
       subtotal, delivery_fee, total,
       payment_method (naqd / online — see Payment note),
       delivery_location, status (yangi → tayyorlanmoqda → yetkazildi,
       or → bekor_qilindi), cancel_reason, created_at, delivered_at
Expense: id, description, amount, created_by_admin_id, created_at
User: telegram_id, name, phone, is_admin (bool)
```

Changes from v1: `stock_qty` (numeric) replaces the boolean `in_stock` so overselling can be prevented; `step` fixes the "can they order 0.3kg?" ambiguity; `bekor_qilindi` (cancelled) is a real status; `delivery_fee`/`subtotal` separate goods cost from delivery cost.

## Customer Mini App — 3 bottom tabs

**1. Mahsulotlar (Products)**
- Grouped by category (e.g. "Sabzavotlar")
- Quantity selector must respect each product's `step` — don't assume whole numbers
- If `stock_qty` is low or zero, show that in the UI ("faqat 2kg qoldi" / out of stock) instead of letting customers over-order

**2. Savatcha (Cart)**
- List of everything added, with quantities and running total; allow editing/removing before checkout
- On tapping buy: server recalculates the total from current prices and stock — reject or flag the order if a price changed or stock ran out since it was added to cart
- Choose payment method: **onlayn** (recorded at the moment the order is placed) or **naqd** (paid directly to the courier at delivery — like Yandex Market's "pay on delivery"), with no mixing the two within a single order; add delivery location via Telegram's native location-sharing, with **manual text address entry as a fallback** if location permission is denied

**3. Tarix (History)**
- Past orders split into pending and completed, with live status
- Include a distinct "bekor qilindi" (cancelled) state, separate from delivered — like every other status, this is set by an admin (see Buyurtmalar tab), not by the customer; the customer only sees it reflected here once it's set

## Admin Mini App — 4 bottom tabs

**1. Mahsulotlar (Products)**
- Create/edit/delete categories and products (name, price, unit, step, image, stock_qty)
- Editing `stock_qty` here is how stock gets replenished

**2. Buyurtmalar (Orders)**
- List of incoming orders, tap to expand full details
- Bot messages the admin's Telegram chat immediately when a new order arrives — don't rely on the admin having the Mini App open
- Status updates: tayyorlanmoqda → yetkazildi, with a "bekor qilindi" action (required reason) for out-of-stock or unfulfillable orders
- Bot messages the customer whenever their order's status changes, in addition to updating their history tab
- On "yetkazildi," the order moves to history for both sides automatically

**3. Daromad / xarajat (Income & expenditure)**
- Income: auto-calculated from delivered orders only (cancelled orders excluded)
- Expenses: manually added by admin (description + amount)
- **Decide before building:** is delivery a flat fee, free, or distance-based? This affects both this tab's math and the customer's checkout total.

**4. Tarix (History)**
- Full log of every completed order and expense: who, what, how much, when
- Cancelled orders appear here too, clearly marked, so they're not confused with completed sales

## Payment note

The official, government-linked option involving a bank agreement is most likely **Uzcard** and/or **Humo**, Uzbekistan's national card payment systems. These are overseen by the Central Bank as part of the government's push to modernize banking and expand cashless payments, and businesses connect to them through a partner bank, which is the entity that actually signs the settlement agreement with the system operator — likely the "bank contract" part you remembered. The more common choice for online stores specifically is **Payme** or **Click**, which have become close to essential on Uzbek e-commerce sites and marketplaces given their combined scale. There are also aggregators (e.g. ATMOS) that bundle Uzcard, Humo, Payme, Click and others behind a single integration, so you don't need a separate contract with each provider — worth a look if negotiating bank agreements one-by-one isn't appealing.

For v1, keep "online" as a placeholder that records intent only — **do not build a fake payment-success flow.** Confirm which gateway you're actually signing up for (bank merchant agreements can take time to process) and wire it up once the ordering flow itself is solid. An order marked "paid" that wasn't actually charged is worse than not offering online payment yet.

Modeling this on Yandex Market's checkout is a good instinct. Its customers choose a payment method during checkout — online by card, a fast-payment system, cash on delivery, or card on delivery — and paying online charges the full order at once, while pay-on-delivery is settled per package when it arrives, with no mixing the two within a single order. That's exactly the onlayn/naqd split already in this doc. Yandex's other options, like its installment plan and Russia's fast-payment system, are Russia-specific infrastructure that doesn't exist in Uzbekistan, so there's nothing else worth copying from there.

## Real-time sync (resolved)

Default to the Mini App polling order status every 5-10 seconds while open — simplest reliable option at small scale — combined with the bot-message notifications above so updates reach people even when the app is closed. Only consider WebSockets later if order volume grows enough that polling becomes noticeably laggy.

## Error & empty states

Explicitly handle: empty product list, empty cart, a failed order submission (e.g. network drop mid-checkout), and an item found out-of-stock at checkout. These are the states most likely to embarrass you in front of the client if left to chance.

## Before you start — decide these

- **Expected scale:** roughly how many products, and how many orders per day? (Determines whether SQLite is fine or Postgres is worth the setup effort.)
- **Delivery fee:** flat amount, free, or distance-based?
- **Hosting:** do you already have a VPS, or does the AI need to suggest one?

## What to build first (suggested order)

1. Bot setup + Mini App launch (distinguishing admin vs customer) + `initData` validation
2. Admin: category + product management, including stock_qty and step
3. Customer: browse products + add to cart
4. Customer: checkout flow with server-side total recalculation + order creation
5. Admin: order list, status updates, cancellation
6. Bot notifications (new order → admin, status change → customer)
7. History views (both sides) driven by order status changes
8. Income/expenditure tab

## Deliverable format

Structure the code as a working project I can run locally, with clear `.env` setup instructions (bot token, database URL, admin Telegram IDs) — not isolated snippets. Include a short manual QA checklist (or a couple of automated tests) covering at minimum: cart total calculation, stock decrement on order, and the delivered → history transition — these are the three places a silent bug costs real money.

---

*This is a paid client project — prioritize correctness and data integrity (no lost orders, no double-charging, no oversold stock) over extra features.*
