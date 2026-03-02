import "./OrdersPage.css";
import { useMemo, useState } from "react";
import EmptyState from "../../components/EmptyState";
import ConfirmModal from "../../components/ConfirmModal";
import Toast from "../../components/Toast";
import {
  EyeIcon,
  EditIcon,
  TrashIcon,
  PlusIcon,
  XIcon,
  OrdersIcon,
  SpinnerIcon,
  ErrorIcon
} from "../../components/Icons";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../data/translations";

export default function OrdersPage({ orders, setOrders, cars, setCars, loading, error }) {
  const { lang } = useLanguage();
  const t = translations[lang];

  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const emptyForm = {
    customerName: "",
    email: "",
    phone: "",
    date: new Date().toISOString().slice(0, 10),
    status: "pending",
    items: [{ carId: "", qty: 1, price: "" }],
  };

  const [formData, setFormData] = useState(emptyForm);

  // ✅ Confirm Dialog
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, orderId: null, status: null, type: 'danger' });

  // ✅ Toast
  const [toast, setToast] = useState({ show: false, message: "" });

  // Sorting state
  const [sortBy, setSortBy] = useState("date"); // date | total | status
  const [sortOrder, setSortOrder] = useState("desc"); // asc | desc

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const nextOrderId = () => {
    const maxNum = (orders || []).reduce((max, o) => {
      const m = String(o.id || "").match(/^ORD-(\d+)$/i);
      if (!m) return max;
      const n = Number(m[1]);
      return Number.isFinite(n) ? Math.max(max, n) : max;
    }, 0);
    return `ORD-${String(maxNum + 1).padStart(3, "0")}`;
  };

  const getCar = (carId) => {
    return (cars || []).find((x) => String(x.id) === String(carId));
  };

  const carLabel = (carId) => {
    const c = getCar(carId);
    if (!c) return "Unknown Car";
    return `${c.make} ${c.model} ${c.year} (${c.trim})`;
  };

  const calcItemTotal = (it) => Number(it.price || 0) * Number(it.qty || 0);
  const calcOrderTotal = (o) =>
    (o.items || []).reduce((sum, it) => sum + calcItemTotal(it), 0);

  const openAddForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const closeAddForm = () => {
    setShowForm(false);
    setFormData(emptyForm);
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEditOrder = (o) => {
    setIsEditing(true);
    setEditingId(o.id);
    setFormData({
      customerName: o.customerName,
      email: o.email,
      phone: o.phone,
      date: o.date,
      status: o.status,
      items: o.items.map(it => ({ ...it })),
    });
    setShowForm(true);
  };

  const handleDeleteClick = (orderId) => {
    setConfirmConfig({
      isOpen: true,
      orderId,
      actionType: 'delete',
      title: t.deleteOrderTitle,
      message: t.deleteOrderMsg,
      confirmText: t.deleteOrder,
      type: "danger"
    });
  };

  const deleteOrder = (orderId) => {
    const order = (orders || []).find((o) => o.id === orderId);
    if (!order) return;

    // Restore stock if it was completed
    if (order.status === "completed") {
      const restoreMap = new Map();
      for (const it of order.items || []) {
        restoreMap.set(it.carId, (restoreMap.get(it.carId) || 0) + Number(it.qty || 0));
      }

      setCars((prevCars) =>
        prevCars.map((c) => {
          const restoreQty = restoreMap.get(Number(c.id)) || 0;
          if (!restoreQty) return c;
          const newStock = Number(c.stock) + restoreQty;
          return {
            ...c,
            stock: newStock,
            status: newStock > 0 ? "available" : c.status,
          };
        })
      );
    }

    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    setToast({ show: true, message: t.orderDeletedSuccess, type: "success" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData((p) => {
      const items = [...p.items];
      items[index] = { ...items[index], [field]: value };

      // عند اختيار سيارة: عبّي السعر تلقائيًا
      if (field === "carId") {
        const selected = (cars || []).find((c) => String(c.id) === String(value));
        if (selected) items[index].price = selected.price;
      }
      return { ...p, items };
    });
  };

  const addItemRow = () => {
    setFormData((p) => ({
      ...p,
      items: [...p.items, { carId: "", qty: 1, price: "" }],
    }));
  };

  const removeItemRow = (index) => {
    setFormData((p) => {
      const items = p.items.filter((_, i) => i !== index);
      return {
        ...p,
        items: items.length ? items : [{ carId: "", qty: 1, price: "" }],
      };
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // phone number must be 10 digits
    if (formData.phone.length !== 10) {
      setToast({
        show: true,
        message: "Phone number must be 10 digits.",
        type: "error",
      });
      return;
    }

    const cleanedItems = (formData.items || [])
      .map((it) => ({
        carId: Number(it.carId),
        qty: Number(it.qty),
        price: Number(it.price),
      }))
      .filter(
        (it) =>
          Number.isFinite(it.carId) &&
          it.carId > 0 &&
          Number.isFinite(it.qty) &&
          it.qty > 0 &&
          Number.isFinite(it.price) &&
          it.price >= 0
      );

    if (!cleanedItems.length) {
      setToast({
        show: true,
        message: t.itemsRequired,
        type: "error",
      });
      return;
    }

    const newOrder = {
      id: nextOrderId(),
      customerName: formData.customerName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      date: formData.date,
      status: formData.status,
      items: cleanedItems,
    };

    if (!newOrder.customerName || !newOrder.email || !newOrder.phone) {
      setToast({
        show: true,
        message: t.customerPhoneRequired,
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      if (isEditing) {
        // Handle Edit
        const oldOrder = orders.find(o => o.id === editingId);

        // If status or items changed, and it involves 'completed', we need to manage stock
        // For simplicity: if old was completed, restore stock. if new is completed, deduct stock.

        if (oldOrder.status === 'completed') {
          // Restore old stock
          const restoreMap = new Map();
          for (const it of oldOrder.items || []) {
            restoreMap.set(it.carId, (restoreMap.get(it.carId) || 0) + Number(it.qty || 0));
          }
          setCars(prev => prev.map(c => {
            const qty = restoreMap.get(Number(c.id)) || 0;
            if (!qty) return c;
            return { ...c, stock: Number(c.stock) + qty, status: 'available' };
          }));
        }

        const updatedOrder = {
          ...oldOrder,
          customerName: formData.customerName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          date: formData.date,
          status: formData.status,
          items: cleanedItems,
        };

        if (updatedOrder.status === 'completed') {
          // Deduct new stock
          const needMap = new Map();
          for (const it of updatedOrder.items || []) {
            needMap.set(it.carId, (needMap.get(it.carId) || 0) + Number(it.qty || 0));
          }
          setCars(prev => prev.map(c => {
            const qty = needMap.get(Number(c.id)) || 0;
            if (!qty) return c;
            const newStock = Number(c.stock) - qty;
            return { ...c, stock: newStock, status: newStock <= 0 ? 'sold' : c.status };
          }));
        }

        setOrders((prev) => prev.map(o => o.id === editingId ? updatedOrder : o));
        setToast({ show: true, message: t.orderUpdatedSuccess });
      } else {
        // Handle Add
        const newOrder = {
          id: nextOrderId(),
          customerName: formData.customerName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          date: formData.date,
          status: formData.status,
          items: cleanedItems,
        };
        setOrders((prev) => [...(prev || []), newOrder]);
        setToast({ show: true, message: t.orderCreatedSuccess });
      }
      setIsSubmitting(false);
      closeAddForm();
    }, 600);
  };

  const handleStatusChangeRequest = (orderId, newStatus) => {
    if (newStatus === "cancelled") {
      setConfirmConfig({
        isOpen: true,
        orderId,
        status: newStatus,
        title: t.cancelOrderTitle,
        message: t.cancelOrderMsg,
        confirmText: t.cancelOrderButton,
        type: "danger"
      });
    } else if (newStatus === "completed") {
      setConfirmConfig({
        isOpen: true,
        orderId,
        status: newStatus,
        title: t.completeOrderTitle,
        message: t.completeOrderMsg,
        confirmText: t.completeDeduct,
        type: "primary"
      });
    } else {
      updateOrderStatus(orderId, newStatus);
    }
  };

  const confirmStatusChange = () => {
    if (confirmConfig.actionType === 'delete') {
      deleteOrder(confirmConfig.orderId);
    } else {
      updateOrderStatus(confirmConfig.orderId, confirmConfig.status);
      const msg = confirmConfig.status === "completed" ? "Order completed successfully." : "Order cancelled.";
      setToast({ show: true, message: msg });
    }
    setConfirmConfig({ ...confirmConfig, isOpen: false });
  };

  // ✅ تحديث حالة الطلب + إنقاص المخزون فقط عند completed
  const updateOrderStatus = (orderId, newStatus) => {
    const order = (orders || []).find((o) => o.id === orderId);
    if (!order) return;

    const prevStatus = order.status;
    if (prevStatus === newStatus) return;

    const goingToCompleted = newStatus === "completed" && prevStatus !== "completed";
    const leavingCompleted = prevStatus === "completed" && newStatus !== "completed";

    if (goingToCompleted) {
      // اجمع احتياج كل carId
      const needMap = new Map();
      for (const it of order.items || []) {
        needMap.set(it.carId, (needMap.get(it.carId) || 0) + Number(it.qty || 0));
      }

      // تحقق من المخزون
      for (const [carId, neededQty] of needMap.entries()) {
        const car = (cars || []).find((c) => Number(c.id) === Number(carId));
        const available = Number(car?.stock ?? 0);

        if (!car) {
          setToast({ show: true, message: `Car not found (ID: ${carId})`, type: "error" });
          return;
        }
        if (available < neededQty) {
          setToast({
            show: true,
            message: `${t.insufficientStock}: ${car.make} ${car.model} (${available}/${neededQty})`,
            type: "error"
          });
          return;
        }
      }

      // نقص المخزون فعليًا
      setCars((prevCars) =>
        prevCars.map((c) => {
          const neededQty = needMap.get(Number(c.id)) || 0;
          if (!neededQty) return c;

          const newStock = Number(c.stock) - neededQty;

          return {
            ...c,
            stock: newStock,
            status: newStock <= 0 ? "sold" : c.status === "sold" ? "available" : c.status,
          };
        })
      );
    } else if (leavingCompleted) {
      // Restore stock if leaving completed status
      const restoreMap = new Map();
      for (const it of order.items || []) {
        restoreMap.set(it.carId, (restoreMap.get(it.carId) || 0) + Number(it.qty || 0));
      }

      setCars((prevCars) =>
        prevCars.map((c) => {
          const restoreQty = restoreMap.get(Number(c.id)) || 0;
          if (!restoreQty) return c;

          const newStock = Number(c.stock) + restoreQty;

          return {
            ...c,
            stock: newStock,
            status: newStock > 0 ? "available" : c.status,
          };
        })
      );
    }

    // حدث الطلب
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    // حدث المودال لو مفتوح
    setSelectedOrder((prev) =>
      prev?.id === orderId ? { ...prev, status: newStatus } : prev
    );
  };

  const sortedOrders = useMemo(() => {
    const sorted = [...(orders || [])];
    sorted.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case "id":
          aVal = a.id;
          bVal = b.id;
          break;
        case "total":
          aVal = calcOrderTotal(a);
          bVal = calcOrderTotal(b);
          break;
        case "status":
          aVal = a.status;
          bVal = b.status;
          break;
        case "date":
          aVal = new Date(a.date).getTime();
          bVal = new Date(b.date).getTime();
          break;
        default:
          // Default to date if sortBy is unrecognized
          aVal = new Date(a.date).getTime();
          bVal = new Date(b.date).getTime();
      }

      if (aVal === bVal) return 0;

      const multiplier = sortOrder === "asc" ? 1 : -1;

      if (typeof aVal === "string" && typeof bVal === "string") {
        return multiplier * aVal.localeCompare(bVal);
      }

      return multiplier * (aVal > bVal ? 1 : -1);
    });
    return sorted;
  }, [orders, sortBy, sortOrder]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  if (loading) return <EmptyState icon={<SpinnerIcon size={48} />} title={t.loading} message={t.loading} />
  if (error) return <EmptyState icon={<ErrorIcon size={48} />} title={t.error} message={error} />

  const rows = sortedOrders;

  return (
    <div>
      {/* Add Order Modal */}
      {showForm && (
        <div className="form-overlay" onClick={closeAddForm}>
          <div className="form-card wide" onClick={(e) => e.stopPropagation()}>
            <h3>{isEditing ? `${t.editOrder} ${editingId}` : t.addNewOrder}</h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t.orderId} ({t.admin})</label>
                <input
                  type="text"
                  value={isEditing ? editingId : nextOrderId()}
                  disabled
                  className="disabled-input"
                />
              </div>
              <div className="form-group">
                <label>{t.customerName}</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label>{t.email}</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>{t.phone}</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="05xxxxxxxx"
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label>{t.date}</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>

              <div className="form-group">
                <label>{t.carSelection}</label>
                <div className="order-items-container">
                  {(formData.items || []).map((item, idx) => (
                    <div key={idx} className="order-item-row">
                      <select
                        value={item.carId}
                        onChange={(e) => handleItemChange(idx, "carId", e.target.value)}
                        required
                      >
                        <option value="">{t.selectCar}</option>
                        {(cars || []).map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.make} {c.model} {c.year} - {c.trim} (Stock: {c.stock})
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => handleItemChange(idx, "qty", e.target.value)}
                        required
                        placeholder={t.qty}
                      />

                      <input
                        type="number"
                        min="0"
                        value={item.price}
                        onChange={(e) => handleItemChange(idx, "price", e.target.value)}
                        required
                        placeholder={t.price}
                      />

                      <span
                        className="remove-icon"
                        onClick={() => removeItemRow(idx)}
                        title="Remove item"
                        style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
                      >
                        <XIcon size={18} />
                      </span>
                    </div>
                  ))}
                </div>

                <button type="button" className="add-btn" onClick={addItemRow} style={{ width: "fit-content", padding: "8px 16px", gap: "8px" }}>
                  <span>{t.addAnotherCar}</span> <PlusIcon size={16} />
                </button>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary-thematic" disabled={isSubmitting}>
                  {isSubmitting ? (isEditing ? t.updating : t.creating) : (isEditing ? t.updateOrder : t.createOrder)}
                </button>
                <button type="button" className="btn-secondary-thematic" onClick={closeAddForm} disabled={isSubmitting}>
                  {t.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="header-page">
        <h1>{t.orders}</h1>
        <button className="add-btn" onClick={() => setShowForm(true)}>
          <div className="ss">
            {t.add} <PlusIcon size={18} />
          </div>
        </button>
      </div>

      {/* Orders Table */}
      <table className="p-table">
        <thead>
          <tr>
            <th onClick={() => handleSort("id")} style={{ cursor: "pointer" }}>
              ID {sortBy === "id" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th>{t.customer}</th>
            <th>{t.items}</th>
            <th onClick={() => handleSort("total")} style={{ cursor: "pointer" }}>
              {t.total} {sortBy === "total" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("date")} style={{ cursor: "pointer" }}>
              {t.date} {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("status")} style={{ cursor: "pointer" }}>
              {t.status} {sortBy === "status" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th>{t.actions}</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>

              <td>
                <div>
                  <strong>{o.customerName}</strong>
                  <br />
                  <small>{o.email}</small>
                </div>
              </td>

              <td>{(o.items || []).length} Items</td>
              <td>${calcOrderTotal(o).toFixed(2)}</td>
              <td>{o.date}</td>

              <td>
                <span
                  className={
                    o.status === "completed"
                      ? "badge active"
                      : o.status === "pending"
                        ? "badge pending"
                        : "badge inactive"
                  }
                >
                  {t[o.status] || o.status}
                </span>
              </td>

              <td>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button className="view-btn" onClick={() => setSelectedOrder(o)} title={t.viewDetails}>
                    <EyeIcon />
                  </button>
                  <button className="edit-btn" onClick={() => handleEditOrder(o)} title={t.editOrder}>
                    <EditIcon />
                  </button>
                  <button className="delete-btn" onClick={() => handleDeleteClick(o.id)} title={t.deleteOrder}>
                    <TrashIcon />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!rows.length && (
        <EmptyState
          icon={<OrdersIcon size={64} />}
          title={t.noOrdersYet}
          message={t.noOrdersMsg}
          actionText={t.createFirstOrder}
          onAction={openAddForm}
        />
      )}

      {/* View Modal */}
      {selectedOrder && (
        <div className="form-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="form-card wide" onClick={(e) => e.stopPropagation()}>
            <div className="header-page" style={{ marginBottom: "1.5rem", paddingBottom: "1rem" }}>
              <h2 style={{ margin: 0, color: "var(--color-primary)" }}>{t.orderDetails} - {selectedOrder.id}</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  background: "var(--color-bg-tertiary)",
                  border: "none",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              ><XIcon size={18} /></button>
            </div>

            <div className="modal-info">
              <div>
                <p className="label">{t.customerName}</p>
                <p className="value">{selectedOrder.customerName}</p>

                <p className="label" style={{ marginTop: 10 }}>{t.date}</p>
                <p className="value">{selectedOrder.date}</p>
              </div>

              <div>
                <p className="label">Email</p>
                <p className="value">{selectedOrder.email}</p>

                <p className="label" style={{ marginTop: 10 }}>{t.phone}</p>
                <p className="value">{selectedOrder.phone || 'N/A'}</p>

                <p className="label" style={{ marginTop: 10 }}>{t.status}</p>
                <span
                  className={
                    selectedOrder.status === "completed"
                      ? "badge active"
                      : selectedOrder.status === "pending"
                        ? "badge pending"
                        : "badge inactive"
                  }
                >
                  {t[selectedOrder.status] || selectedOrder.status}
                </span>
              </div>
            </div>

            <h3 style={{ marginTop: 18, marginBottom: 10 }}>{t.orderItems}</h3>

            <div className="items-box">
              <div className="items-head">
                <span>{t.car}</span>
                <span>{t.stock}</span>
                <span>{t.price}</span>
                <span>{t.total}</span>
              </div>

              {(selectedOrder.items || []).map((it, idx) => {
                const car = getCar(it.carId);
                return (
                  <div className="items-row" key={idx} style={{ alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {car && car.image && (
                        <img
                          src={car.image}
                          alt="car"
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "6px",
                            border: "1px solid var(--color-bg-tertiary)"
                          }}
                        />
                      )}
                      <span>{carLabel(it.carId)}</span>
                    </div>
                    <span>{it.qty}</span>
                    <span>${Number(it.price).toFixed(2)}</span>
                    <span>${calcItemTotal(it).toFixed(2)}</span>
                  </div>
                );
              })}

              <div className="items-total">
                <span>{t.total}</span>
                <span>${calcOrderTotal(selectedOrder).toFixed(2)}</span>
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: "2rem" }}>
              <button
                className="btn-secondary-thematic"
                onClick={() => handleStatusChangeRequest(selectedOrder.id, "pending")}
              >
                {t.markPending}
              </button>

              <button
                className="btn-primary-thematic"
                onClick={() => handleStatusChangeRequest(selectedOrder.id, "completed")}
              >
                {t.markCompleted}
              </button>

              <button
                className="btn-danger-thematic"
                onClick={() => handleStatusChangeRequest(selectedOrder.id, "cancelled")}
              >
                {t.cancelOrderButton}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmStatusChange}
        onCancel={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        confirmText={confirmConfig.confirmText}
        type={confirmConfig.type}
      />

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}
