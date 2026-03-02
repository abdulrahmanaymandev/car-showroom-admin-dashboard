import "./ProductPage.css";
import { useEffect, useMemo, useState } from "react";
import EmptyState from "../../components/EmptyState";
import ConfirmModal from "../../components/ConfirmModal";
import Toast from "../../components/Toast";
import {
  EditIcon,
  TrashIcon,
  PlusIcon,
  InventoryIcon,
  AlertIcon,
  SpinnerIcon,
  ErrorIcon
} from "../../components/Icons";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../data/translations";

export default function ProductPage({ cars, setCars, loading, error }) {
  const { lang } = useLanguage();
  const t = translations[lang];

  const [showForm, setShowForm] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [viewingImage, setViewingImage] = useState(null); // { url, title, details }

  // ✅ Search & Filters
  const [q, setQ] = useState("");
  const [filterMake, setFilterMake] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all"); // all | available | sold

  // ✅ Confirm Dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState(null);

  // ✅ Toast
  const [toast, setToast] = useState({ show: false, message: "" });

  // ✅ Sorting
  const [sortBy, setSortBy] = useState("id"); // id | price | stock | year
  const [sortOrder, setSortOrder] = useState("asc"); // asc | desc

  const emptyForm = {
    stockNo: "",
    make: "",
    model: "",
    year: "",
    trim: "",
    color: "",
    price: "",
    stock: "",
    image: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  const nextNumericId = () => {
    const maxId = (cars || []).reduce((max, c) => {
      const n = Number(c.id);
      return Number.isFinite(n) ? Math.max(max, n) : max;
    }, 0);
    return maxId + 1;
  };

  const nextStockNo = () => {
    const maxNum = (cars || []).reduce((max, c) => {
      const m = String(c.stockNo || "").match(/^STK-(\d+)$/i);
      if (!m) return max;
      const n = Number(m[1]);
      return Number.isFinite(n) ? Math.max(max, n) : max;
    }, 0);
    return `STK-${String(maxNum + 1).padStart(4, "0")}`;
  };

  const openAddForm = () => {
    setEditingCar(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (car) => {
    setEditingCar(car);
    setFormData({
      stockNo: car.stockNo ?? "",
      make: car.make ?? "",
      model: car.model ?? "",
      year: car.year ?? "",
      trim: car.trim ?? "",
      color: car.color ?? "",
      price: car.price ?? "",
      stock: car.stock ?? "",
      image: car.image ?? "",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCar(null);
    setFormData(emptyForm);
  };

  const openImageView = (car) => {
    setViewingImage({
      url: car.image,
      title: `${car.make} ${car.model} ${car.year}`,
      details: car
    });
  };

  const closeImageView = () => {
    setViewingImage(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleDelete = (carId) => {
    setCarToDelete(carId);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (carToDelete) {
      setCars((prev) => prev.filter((c) => c.id !== carToDelete));
      setConfirmOpen(false);
      setCarToDelete(null);
      setToast({ show: true, message: t.carRemovedSuccess });
    }
  };

  const normalizePayload = () => {
    return {
      make: String(formData.make).trim(),
      model: String(formData.model).trim(),
      year: Number(formData.year),
      trim: String(formData.trim).trim(),
      color: String(formData.color).trim(),
      price: Number(formData.price),
      stock: Number(formData.stock),
      image: String(formData.image).trim(),
    };
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = normalizePayload();

    if (!payload.make || !payload.model || !payload.trim) {
      setToast({ show: true, message: t.makeModelTrimRequired, type: "error" });
      return;
    }
    if (!Number.isFinite(payload.year) || payload.year < 2000) {
      setToast({ show: true, message: t.yearInvalid, type: "error" });
      return;
    }
    if (!Number.isFinite(payload.price) || payload.price < 0) {
      setToast({ show: true, message: t.priceInvalid, type: "error" });
      return;
    }
    if (!Number.isFinite(payload.stock) || payload.stock < 0) {
      setToast({ show: true, message: t.stockInvalid, type: "error" });
      return;
    }

    setIsSubmitting(true);

    // Simulate real API call
    setTimeout(() => {
      if (editingCar) {
        setCars((prev) =>
          prev.map((c) => (c.id === editingCar.id ? { ...c, ...payload } : c))
        );
      } else {
        setCars((prev) => [...prev, { id: nextNumericId(), stockNo: nextStockNo(), ...payload }]);
      }

      setIsSubmitting(false);
      closeForm();
    }, 600);
  };

  // ✅ Filter options
  const makeOptions = useMemo(() => {
    const set = new Set((cars || []).map((c) => (c.make || "").trim()).filter(Boolean));
    return ["all", ...Array.from(set).sort()];
  }, [cars]);

  const yearOptions = useMemo(() => {
    const set = new Set((cars || []).map((c) => Number(c.year)).filter((y) => Number.isFinite(y)));
    return ["all", ...Array.from(set).sort((a, b) => b - a).map(String)];
  }, [cars]);

  const getStatus = (stock) => (Number(stock) > 0 ? "available" : "sold");
  const statusClass = (stock) => (Number(stock) > 0 ? "status-g" : "status-r");

  // ✅ Filtered rows
  const filteredCars = useMemo(() => {
    const query = q.trim().toLowerCase();

    return (cars || []).filter((c) => {
      const status = getStatus(c.stock);

      if (filterMake !== "all" && (c.make || "") !== filterMake) return false;
      if (filterYear !== "all" && String(c.year) !== String(filterYear)) return false;
      if (filterStatus !== "all" && status !== filterStatus) return false;

      if (!query) return true;

      const blob = [
        c.stockNo,
        c.make,
        c.model,
        c.year,
        c.trim,
        c.color,
      ]
        .map((x) => String(x ?? "").toLowerCase())
        .join(" ");

      return blob.includes(query);
    });
  }, [cars, q, filterMake, filterYear, filterStatus]);

  // ✅ Sorted cars
  const sortedCars = useMemo(() => {
    const sorted = [...filteredCars];

    sorted.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case "stockNo":
          aVal = a.stockNo;
          bVal = b.stockNo;
          break;
        case "car":
          aVal = `${a.make} ${a.model}`;
          bVal = `${b.make} ${b.model}`;
          break;
        case "color":
          aVal = a.color;
          bVal = b.color;
          break;
        case "price":
          aVal = Number(a.price);
          bVal = Number(b.price);
          break;
        case "stock":
          aVal = Number(a.stock);
          bVal = Number(b.stock);
          break;
        case "year":
          aVal = Number(a.year);
          bVal = Number(b.year);
          break;
        case "status":
          aVal = getStatus(a.stock);
          bVal = getStatus(b.stock);
          break;
        default: // id
          aVal = Number(a.id);
          bVal = Number(b.id);
      }

      if (aVal === bVal) return 0;
      const multiplier = sortOrder === "asc" ? 1 : -1;

      if (typeof aVal === "string" && typeof bVal === "string") {
        return multiplier * aVal.localeCompare(bVal);
      }

      return multiplier * (aVal > bVal ? 1 : -1);
    });

    return sorted;
  }, [filteredCars, sortBy, sortOrder]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const clearFilters = () => {
    setQ("");
    setFilterMake("all");
    setFilterYear("all");
    setFilterStatus("all");
    setSortBy("id");
    setSortOrder("asc");
  };

  if (loading) return <EmptyState icon={<SpinnerIcon size={48} />} title={t.loading} message={t.loading} />
  if (error) return <EmptyState icon={<ErrorIcon size={48} />} title={t.error} message={error} />

  return (
    <div>
      {showForm && (
        <div className="form-overlay" onClick={closeForm}>
          <div className="form-card" onClick={(e) => e.stopPropagation()}>
            <h3>{editingCar ? t.edit : t.add}</h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t.stockNo} ({t.admin})</label>
                <input
                  type="text"
                  value={editingCar ? editingCar.stockNo : nextStockNo()}
                  disabled
                  className="disabled-input"
                />
              </div>

              <div className="form-group">
                <label>{t.make}</label>
                <input
                  type="text"
                  name="make"
                  value={formData.make}
                  onChange={handleInputChange}
                  placeholder="Hyundai"
                  required
                />
              </div>

              <div className="form-group">
                <label>{t.model}</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  placeholder="Accent"
                  required
                />
              </div>

              <div className="form-group">
                <label>{t.year}</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  min="2000"
                  required
                />
              </div>

              <div className="form-group">
                <label>{t.trim}</label>
                <input
                  type="text"
                  name="trim"
                  value={formData.trim}
                  onChange={handleInputChange}
                  placeholder="Smart / GL / Full..."
                  required
                />
              </div>

              <div className="form-group">
                <label>{t.color}</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="White"
                  required
                />
              </div>

              <div className="form-group">
                <label>{t.price}</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>{t.stock}</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>{t.image} URL</label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://..."
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary-thematic" disabled={isSubmitting}>
                  {isSubmitting ? t.loading : editingCar ? t.save : t.add}
                </button>
                <button type="button" className="btn-secondary-thematic" onClick={closeForm} disabled={isSubmitting}>{t.cancel}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="header-page">
        <h1>{t.inventory}</h1>
        <button className="add-btn" onClick={openAddForm} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>{t.add}</span> <PlusIcon size={18} />
        </button>
      </div>

      {/* ✅ Search & Filters Bar */}
      <div className="filter-bar">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`${t.search}...`}
        />

        <select value={filterMake} onChange={(e) => setFilterMake(e.target.value)}>
          {makeOptions.map((m) => (
            <option key={m} value={m}>
              {m === "all" ? t.allMakes : m}
            </option>
          ))}
        </select>

        <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y === "all" ? t.allYears : y}
            </option>
          ))}
        </select>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">{t.allStatus}</option>
          <option value="available">{t.available}</option>
          <option value="sold">{t.sold}</option>
        </select>

        <button onClick={clearFilters}>
          {t.clear}
        </button>

        <div style={{ marginLeft: "auto", alignSelf: "center", color: "var(--color-text-secondary)", fontWeight: "var(--font-weight-semibold)" }}>
          {t.showing} <b>{filteredCars.length}</b> / {cars.length}
        </div>
      </div>

      <table className="p-table">
        <thead>
          <tr>
            <th onClick={() => handleSort("id")} style={{ cursor: "pointer" }}>
              ID {sortBy === "id" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("stockNo")} style={{ cursor: "pointer" }}>
              {t.stockNo} {sortBy === "stockNo" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("car")} style={{ cursor: "pointer" }}>
              {t.car} {sortBy === "car" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("color")} style={{ cursor: "pointer" }}>
              {t.color} {sortBy === "color" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("price")} style={{ cursor: "pointer" }}>
              {t.price} {sortBy === "price" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("stock")} style={{ cursor: "pointer" }}>
              {t.stock} {sortBy === "stock" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("status")} style={{ cursor: "pointer" }}>
              {t.status} {sortBy === "status" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th>{t.image}</th>
            <th>{t.actions}</th>
          </tr>
        </thead>

        <tbody>
          {sortedCars.map((c) => {
            const stock = Number(c.stock);
            const isLowStock = stock > 0 && stock <= 5;
            const isOutOfStock = stock === 0;

            return (
              <tr key={c.id} className={isLowStock ? 'low-stock-warning' : ''}>
                <td>{c.id}</td>
                <td>{c.stockNo}</td>
                <td>{c.make} {c.model} {c.year} ({c.trim})</td>
                <td>{c.color}</td>
                <td>${Number(c.price).toLocaleString()}</td>
                <td className={`stock-cell ${isLowStock ? 'stock-low' : ''} ${isOutOfStock ? 'stock-out' : ''}`}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "center" }}>
                    {c.stock}
                    {isLowStock && <AlertIcon size={14} />}
                  </div>
                </td>
                <td>
                  <span className={`status-s ${statusClass(c.stock)}`}>
                    {t[getStatus(c.stock)] || getStatus(c.stock)}
                  </span>
                </td>
                <td className="img-cell">
                  <img
                    src={c.image}
                    className="image-product"
                    alt={`${c.make} ${c.model}`}
                    onClick={() => openImageView(c)}
                    style={{ cursor: "pointer" }}
                  />
                </td>
                <td>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button className="edit-btn" onClick={() => openEditForm(c)} title="Edit Car">
                      <EditIcon />
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(c.id)} title="Delete Car">
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {!filteredCars.length && (
        <EmptyState
          icon={<InventoryIcon size={64} />}
          title={cars.length === 0 ? t.noCarsFound : t.noResultsFound}
          message={
            cars.length === 0
              ? t.noCarsMsg
              : t.noResultsMsg
          }
          actionText={cars.length === 0 ? t.addFirstCar : t.clearFilters}
          onAction={cars.length === 0 ? openAddForm : clearFilters}
        />
      )}

      <ConfirmModal
        isOpen={confirmOpen}
        title={t.removeCarTitle}
        message={t.removeCarMsg}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
        confirmText={t.removeCar}
        type="danger"
      />

      <Toast
        show={toast.show}
        message={toast.message}
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/* ✅ Image View Modal */}
      {viewingImage && (
        <div className="form-overlay" onClick={closeImageView} style={{ zIndex: 1100 }}>
          <div className="form-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px", padding: "1.5rem" }}>
            <h3 style={{ marginBottom: "1rem" }}>{viewingImage.title}</h3>

            <div style={{
              width: "100%",
              height: "300px",
              marginBottom: "1.5rem",
              borderRadius: "8px",
              overflow: "hidden",
              border: "2px solid var(--color-bg-tertiary)"
            }}>
              <img
                src={viewingImage.url}
                alt={viewingImage.title}
                style={{ width: "100%", height: "100%", objectFit: "contain", background: "var(--color-bg-secondary)" }}
              />
            </div>

            <div className="view-details-grid" style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              background: "var(--color-bg-secondary)",
              padding: "1rem",
              borderRadius: "12px"
            }}>
              <div><strong>{t.stockNo}:</strong> {viewingImage.details.stockNo}</div>
              <div><strong>{t.trim}:</strong> {viewingImage.details.trim}</div>
              <div><strong>{t.color}:</strong> {viewingImage.details.color}</div>
              <div><strong>{t.price}:</strong> ${Number(viewingImage.details.price).toLocaleString()}</div>
              <div><strong>{t.stock}:</strong> {viewingImage.details.stock}</div>
              <div>
                <strong>{t.status}:</strong>
                <span className={`status-s ${statusClass(viewingImage.details.stock)}`} style={{ marginLeft: "8px", fontSize: "0.75rem" }}>
                  {t[getStatus(viewingImage.details.stock)] || getStatus(viewingImage.details.stock)}
                </span>
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: "1.5rem" }}>
              <button className="btn-secondary-thematic" onClick={closeImageView}>
                {t.views ? t.close : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
