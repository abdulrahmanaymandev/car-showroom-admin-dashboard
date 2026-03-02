import StatCard from "./StatCard";
import "./MainContent.css";

import { Routes, Route, Navigate } from "react-router-dom";

import ProductPage from "../Pages/Products/ProductPage";
import OrdersPage from "../Pages/Orders/OrdersPage";
import UsersPage from "../Pages/Users/UsersPage";
import OrderStatus from "./OrderStatus";
import EmptyState from "./EmptyState";

import CarSpecificationsPage from "../Pages/CarSpecifications/CarSpecificationsPage";
import { SpinnerIcon, ErrorIcon, CarIcon, OrdersIcon, DollarIcon } from "./Icons";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../data/translations";

function DashboardOverview({ cars, orders, loading, error }) {
  const { lang } = useLanguage();
  const t = translations[lang];

  const totalCars = cars.length;
  const availableCars = cars.filter((c) => Number(c.stock) > 0).length;
  const totalOrders = orders.length;

  const revenue = orders
    .filter((order) => order.status === "completed")
    .reduce((total, order) => {
      const orderTotal = order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
      return total + orderTotal;
    }, 0);

  if (loading) {
    return <EmptyState icon={<SpinnerIcon size={80} />} title={t.loading} message={t.loading} />;
  }
  if (error) {
    return <EmptyState icon={<ErrorIcon size={80} />} title={t.error} message={error} />;
  }

  return (
    <div>
      <h1>{t.dashboardOverview}</h1>
      <div className="cards">
        <StatCard
          title={t.totalCars}
          value={totalCars}
          icon={<CarIcon size={40} />}
        />
        <StatCard
          title={t.availableCars}
          value={availableCars}
          icon={<CarIcon size={40} />}
        />
        <StatCard
          title={t.totalOrders}
          value={totalOrders}
          icon={<OrdersIcon size={40} />}
        />
        <StatCard
          title={t.revenue}
          value={`$${revenue.toLocaleString()}`}
          icon={<DollarIcon size={40} />}
        />
      </div>
      <OrderStatus orders={orders} />
    </div>
  );
}

export default function MainContent({
  isOpen,
  cars,
  setCars,
  orders,
  setOrders,
  users,
  setUsers,
  loading,
  error,
}) {
  const mainClassName = isOpen ? "shifted main" : "main";

  return (
    <div className={mainClassName}>
      <Routes>
        {/* /dashboard */}
        <Route
          path="/"
          element={<DashboardOverview cars={cars} orders={orders} loading={loading} error={error} />}
        />

        {/* /dashboard/products */}
        <Route
          path="products"
          element={<ProductPage cars={cars} setCars={setCars} loading={loading} error={error} />}
        />

        {/* /dashboard/orders */}
        <Route
          path="orders"
          element={
            <OrdersPage
              orders={orders}
              setOrders={setOrders}
              cars={cars}
              setCars={setCars}
              loading={loading}
              error={error}
            />
          }
        />

        {/* /dashboard/users */}
        <Route
          path="users"
          element={<UsersPage users={users} setUsers={setUsers} loading={loading} error={error} />}
        />

        {/* ✅ NEW: /dashboard/search */}
        <Route path="specifications" element={<CarSpecificationsPage />} />

        {/* fallback inside dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}
