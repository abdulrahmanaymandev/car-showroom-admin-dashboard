# Cars Showroom Admin Dashboard

A modern admin dashboard for managing a car showroom. The app provides a clean, multi-page interface for inventory, orders, users, and car specifications, with built-in dark mode and bilingual (LTR/RTL) support.

**Live Demo
https://car-showroom-admin-dashboard.netlify.app

**Demo Login**
- Email: `admin@gmail.com`
- Password: `admin`

**Features**
- Dashboard overview with KPIs (total cars, available cars, total orders, completed revenue) and order status breakdown.
- Inventory management with search, multi-filtering, sortable columns, add/edit/delete, image preview, and low‑stock indicators.
- Orders management with create/edit/delete, line items, status workflow (pending/completed/cancelled), stock deduction and restoration, and detailed order view.
- User management with roles and status, add/edit/delete, and sortable columns.
- Car specifications lookup with autocomplete and detailed spec cards.
- Toast notifications and confirmation modals for critical actions.
- Responsive sidebar layout with routing and protected dashboard access.

**Tech Stack**
- React 19
- React Router DOM 7
- Lucide React (icon library)
- Vite (build/dev tooling)
- ESLint (code quality)

**Project Structure**
- `src/App.jsx` sets up routing, login gating, and app‑wide providers.
- `src/layouts/DashBoard.jsx` hosts the shell layout, sidebar, header, and data state.
- `src/components/` shared UI (cards, tables, empty states, toasts, modals, icons).
- `src/Pages/` page features:
  - `Login` (auth screen)
  - `Products` (inventory)
  - `Orders` (orders and stock handling)
  - `Users` (staff management)
  - `CarSpecifications` (spec search)
- `src/context/` global theme and language state.
- `src/data/` mock seed data and translations.
- `src/api/` mock car‑spec API helpers and a ready external API wrapper.

**Data Handling**
- Initial data is seeded from `src/data/data.js`.
- The dashboard simulates a fetch delay and then hydrates state from `localStorage` when present.
- Changes to cars, orders, and users are persisted back to `localStorage`.
- The car‑specs page uses a mock API (`mockCarsApi.js`) with simulated latency.
- An external API wrapper (`carsApi.js`) is prepared for live car data via `VITE_NINJAS_KEY`, but the current UI uses the mock data source.

**Dark Mode**
- Toggled from the header.
- Persisted in `localStorage` and applied via the `data-theme` attribute on `html`.

**Multi‑Language (LTR/RTL)**
- Toggle between English and Arabic from the header.
- Language is persisted in `localStorage`.
- The document `dir` attribute switches to `rtl` for Arabic and `ltr` for English.

**Getting Started**
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the dev server:
   ```bash
   npm run dev
   ```
3. Optional: add a `.env` with `VITE_NINJAS_KEY` if you want to wire the external car API.

**Future Improvements**
- Replace mock data and localStorage with a real backend and authentication.
- Add role-based access control and audit logs.
- Introduce pagination and server‑side filtering for large inventories and orders.
- Integrate the external car API into the specifications page.

## Author
Abdulrahman Ayman 
Frontend Developer
