# TrungFuzzy

The project is split into two independent applications:

- `trungfuzzy`: React + Vite user application (`http://localhost:5173`)
- `trungfuzzy-backend`: Next.js API (`http://localhost:3001`)

## Run locally

From the frontend directory, one command starts both independent applications:

```powershell
cd trungfuzzy
npm.cmd run dev
```

For separate terminals, run `npm.cmd run dev:client` in `trungfuzzy` and
`npm.cmd run dev` in `trungfuzzy-backend`.

Before production, copy `.env.example` to `.env.local` in the backend and set a
strong random `JWT_SECRET`.

The frontend uses `http://localhost:3001/api` by default. Override it with
`VITE_API_URL` when deploying.

## User API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/oauth/google`
- `GET /api/auth/oauth/facebook`
- `GET/PATCH/DELETE /api/users/me`
- `GET/POST /api/users/me/addresses`
- `PATCH/DELETE /api/users/me/addresses/:addressId`

Protected requests require `Authorization: Bearer <token>`.

## Product management

- Client catalog: `http://localhost:5173/shop`
- Admin UI: `http://localhost:5173/admin/products`
- Admin users: `http://localhost:5173/admin/users`
- Admin orders: `http://localhost:5173/admin/orders`
- Product API: `GET/POST /api/products`
- Product detail API: `GET/PATCH/DELETE /api/products/:productId`
- Category API: `GET/POST /api/categories`
- Category update API: `PATCH/DELETE /api/categories/:categoryId`

Admin mutations require `X-Admin-Key`. Local development defaults to
`dev-admin-key`; set a strong `ADMIN_API_KEY` in backend `.env.local` outside
development.

New password accounts start in `pending` status and cannot log in until approved
from Admin Users. Admins can approve, lock, unlock, promote or delete accounts.
The email matching `ADMIN_EMAIL` is created as an active admin; the local default
is `admin@fuzzy.local`.

## Order management

- Checkout: `http://localhost:5173/checkout`
- Order history: `http://localhost:5173/order-history`
- Admin orders: `http://localhost:5173/admin/orders`
- Create/list orders: `POST/GET /api/orders`
- View/update status: `GET/PATCH /api/orders/:orderId`

Creating an order validates and decrements stock. Cancelling an order from the
admin workflow restores its stock. VNPay and MoMo are represented in the
checkout flow, but real payment redirects require merchant sandbox credentials.

## PWA testing

Service Worker registration is enabled only in production builds to avoid stale
Vite development assets:

```powershell
cd trungfuzzy
npm.cmd run build
npm.cmd run preview
```

Use Chrome/Edge DevTools → Application to inspect the manifest, service worker,
cache storage and offline mode.

The JSON data store is intended for local/demo use. Replace `lib/db.ts` with
PostgreSQL/MySQL before multi-instance production deployment.

Google/Facebook OAuth credentials are listed in `.env.example`; provider
activation still requires valid credentials and callback URLs from each provider.
