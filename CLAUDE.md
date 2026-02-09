# Table Order System - Project Context

## Project Overview
Tablet-based restaurant self-order system (table order).
Design docs completed (12 steps in `docs/design/`), code implementation Sprint 0~2 done.

## Tech Stack
- **Server**: Node.js 20 + Express 5 + TypeScript + Drizzle ORM + PostgreSQL (Supabase)
- **Client**: React 19 + Vite 6 + TypeScript + Zustand + Tailwind CSS 3
- **Auth**: JWT (16h expiry), bcrypt
- **Real-time**: SSE (Server-Sent Events)
- **DB**: Supabase (hosted PostgreSQL) - switched from Docker PostgreSQL

## Current Status

### COMPLETED
- 12-step design documents (`docs/design/step-01~12-*.md`)
- Server code: all modules (auth, menu, order, session), middleware, DB schema, seed, SSE
- Client code: customer app (login, menu, cart, order success, order history) + admin app (login, dashboard, SSE)
- Requirements from `requirements/` applied (auto-login, confirm dialogs, order history modal, etc.)
- TypeScript compilation: PASS (server + client)
- Vite production build: PASS (264KB JS, 18KB CSS)
- Server tsc build: PASS (28 JS files in `server/dist/`)

### PENDING - Next Steps
1. **Set Supabase DATABASE_URL** in `.env` file (user needs to provide connection string)
2. **Run `npm run db:push`** to apply schema to Supabase
3. **Run `npm run db:seed`** to insert test data
4. **Run `npm run dev`** to start dev server
5. Docker/Colima cleanup (installed but not needed anymore)
6. Tests not written yet

## Project Structure
```
aidlc-workshp-awsdevops/
├── .env.example          # Supabase DB URL template
├── .env                  # NEEDS UPDATE: set real Supabase DATABASE_URL
├── package.json          # npm workspaces (server + client)
├── docker-compose.yml    # NO LONGER USED (switched to Supabase)
├── requirements/
│   ├── table-order-requirements.md  # Full requirements doc
│   └── constraints.md               # Excluded features
├── docs/design/          # 12 design documents
├── server/
│   ├── package.json
│   ├── tsconfig.json     # NodeNext module resolution
│   ├── drizzle.config.ts
│   ├── dist/             # Built JS output
│   └── src/
│       ├── app.ts                    # Express app setup
│       ├── index.ts                  # Server entry
│       ├── db/
│       │   ├── schema.ts            # 8 tables (Drizzle)
│       │   ├── client.ts            # DB connection (prepare: false for Supabase)
│       │   └── seed.ts              # Demo data
│       ├── shared/
│       │   ├── errors/domain-error.ts
│       │   ├── middleware/           # auth, error-handler, logger, rate-limit, request-id, validate
│       │   ├── sse/sse-manager.ts
│       │   └── types/api.ts
│       └── modules/
│           ├── auth/     # POST /auth/admin/login, POST /auth/table/login
│           ├── menu/     # GET /menu-items, GET /categories
│           ├── order/    # POST /orders, GET /orders, admin CRUD, SSE events
│           └── session/  # Session lifecycle, order history archiving
└── client/
    ├── package.json
    ├── vite.config.ts    # Proxy /api -> localhost:4000
    ├── tailwind.config.ts
    ├── dist/             # Built output
    └── src/
        ├── App.tsx               # Router + auth guards
        ├── main.tsx
        ├── shared/
        │   ├── api/client.ts     # Fetch wrapper
        │   ├── types/api.ts      # Shared types
        │   └── components/       # LoadingSpinner, ConfirmDialog
        ├── customer/
        │   ├── pages/            # LoginPage, MenuPage, CartPage, OrderSuccessPage, OrderHistoryPage
        │   ├── components/       # MenuCard, CategoryTabs, CartItem
        │   └── stores/           # auth-store (auto-login), cart-store (persist)
        └── admin/
            ├── pages/            # LoginPage, DashboardPage
            ├── components/       # OrderCard (delete confirm), TableCard (total, complete, history), OrderHistoryModal
            ├── stores/           # auth-store
            └── hooks/            # useSSE
```

## DB Schema (8 tables)
stores, admins, table_info, categories, menu_items, table_sessions, orders, order_items, order_history

## Seed Data
- Store: `demo-store` / "Demo Store"
- Admin: `admin` / `admin1234`
- Tables: 1~5 / password `1234`
- Categories: Main, Side, Drink, Dessert
- Menu items: 12 items

## API Endpoints
- `POST /api/v1/auth/admin/login` - Admin login (storeIdentifier + username + password)
- `POST /api/v1/auth/table/login` - Table login (storeIdentifier + tableNumber + password)
- `GET  /api/v1/categories` - List categories
- `GET  /api/v1/menu-items` - List menu items
- `POST /api/v1/orders` - Create order (TABLE role)
- `GET  /api/v1/orders` - List session orders (TABLE role)
- `GET  /api/v1/admin/events` - SSE stream (ADMIN role, token via query param)
- `GET  /api/v1/admin/orders` - List all store orders
- `PATCH /api/v1/admin/orders/:id/status` - Change order status
- `DELETE /api/v1/admin/orders/:id` - Delete order
- `GET  /api/v1/admin/tables` - List tables
- `POST /api/v1/admin/tables/:id/complete` - Complete table session
- `GET  /api/v1/admin/tables/:id/history` - Order history

## Key Decisions
- `prepare: false` in postgres.js for Supabase Transaction Pooler compatibility
- Auth middleware supports both `Authorization: Bearer` header and `?token=` query param (for SSE)
- Client stores `storeIdentifier: 'demo-store'` hardcoded for demo
- Order success page: 5-second countdown then redirect to menu
- Auto-login: saves tableNumber + password in localStorage, auto re-login on restore

## Commands
```bash
npm install              # Install all dependencies
npm run db:push          # Push schema to Supabase (needs DATABASE_URL in .env)
npm run db:seed          # Seed demo data
npm run dev              # Run server (port 4000) + client (port 5173)
npm run dev:server       # Server only
npm run dev:client       # Client only
npm run build            # Build both server + client
```

## Login Info
- Customer: http://localhost:5173 -> Table 1~5 / password: 1234
- Admin: http://localhost:5173/admin -> admin / admin1234
