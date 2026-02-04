import Header from "../components/Header";
import SideBar from "../components/SideBar";
import MainContent from "../components/MainContent";
import "./dashBoard.css";
import { useEffect, useState } from "react";
import { carsData, ordersData, usersData } from "../data/data";

export default function DashBoard({ setIsLoggedIn }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [cars, setCars] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Mock fetch for local data (keeps your requirement)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const delay = Math.floor(Math.random() * (1200 - 800 + 1)) + 800;
        await new Promise((resolve) => setTimeout(resolve, delay));

        const savedCars = localStorage.getItem("cars");
        const savedOrders = localStorage.getItem("orders");
        const savedUsers = localStorage.getItem("users");

        setCars(savedCars ? JSON.parse(savedCars) : carsData);
        setOrders(savedOrders ? JSON.parse(savedOrders) : ordersData);
        setUsers(savedUsers ? JSON.parse(savedUsers) : usersData);
      } catch (e) {
        setError(e.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && !error) localStorage.setItem("cars", JSON.stringify(cars));
  }, [cars, loading, error]);

  useEffect(() => {
    if (!loading && !error) localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders, loading, error]);

  useEffect(() => {
    if (!loading && !error) localStorage.setItem("users", JSON.stringify(users));
  }, [users, loading, error]);

  return (
    <div>
      <Header isOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <div className="dashboard-shell">
        <SideBar isOpen={isMenuOpen} setIsLoggedIn={setIsLoggedIn} />

        <MainContent
          isOpen={isMenuOpen}
          cars={cars}
          setCars={setCars}
          orders={orders}
          setOrders={setOrders}
          users={users}
          setUsers={setUsers}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
}
