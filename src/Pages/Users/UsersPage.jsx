import "./UsersPage.css";
import { useState } from "react";
import EmptyState from "../../components/EmptyState";
import ConfirmModal from "../../components/ConfirmModal";
import Toast from "../../components/Toast";
import {
    EditIcon,
    TrashIcon,
    PlusIcon,
    UsersIcon,
    SpinnerIcon,
    ErrorIcon
} from "../../components/Icons";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../data/translations";

export default function UsersPage({ users, setUsers, loading, error }) {
    const { lang } = useLanguage();
    const t = translations[lang];

    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const emptyForm = {
        name: "",
        email: "",
        role: "Sales",
        status: "active",
    };


    const [formData, setFormData] = useState(emptyForm);

    // ✅ Confirm Dialog
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // ✅ Toast
    const [toast, setToast] = useState({ show: false, message: "" });

    // ✅ Sorting
    const [sortBy, setSortBy] = useState("id");
    const [sortOrder, setSortOrder] = useState("asc");

    const nextId = () => {
        const maxId = (users || []).reduce((max, u) => Math.max(max, u.id || 0), 0);
        return maxId + 1;
    };

    const openAddForm = () => {
        setEditingUser(null);
        setFormData(emptyForm);
        setShowForm(true);
    };

    const openEditForm = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
        });
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingUser(null);
        setFormData(emptyForm);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: value }));
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email) {
            setToast({ show: true, message: t.nameEmailRequired, type: "error" });
            return;
        }

        setIsSubmitting(true);

        // Simulate real API call
        setTimeout(() => {
            if (editingUser) {
                setUsers((prev) =>
                    prev.map((u) => (u.id === editingUser.id ? { ...u, ...formData } : u))
                );
            } else {
                setUsers((prev) => [...prev, { id: nextId(), ...formData }]);
            }
            setIsSubmitting(false);
            closeForm();
        }, 600);
    };

    const handleDelete = (id) => {
        setUserToDelete(id);
        setConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (userToDelete) {
            setUsers((prev) => prev.filter((u) => u.id !== userToDelete));
            setConfirmOpen(false);
            setUserToDelete(null);
            setToast({ show: true, message: t.staffRemovedSuccess });
        }
    };

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortOrder("asc");
        }
    };

    const sortedUsers = (users || []).slice().sort((a, b) => {
        let aVal, bVal;
        switch (sortBy) {
            case "name":
                aVal = a.name;
                bVal = b.name;
                break;
            case "email":
                aVal = a.email;
                bVal = b.email;
                break;
            case "role":
                aVal = a.role;
                bVal = b.role;
                break;
            case "status":
                aVal = a.status;
                bVal = b.status;
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

    if (loading) return <EmptyState icon={<SpinnerIcon size={48} />} title={t.loading} message={t.loading} />
    if (error) return <EmptyState icon={<ErrorIcon size={48} />} title={t.error} message={error} />

    return (
        <div className="users-page">
            <div className="header-page">
                <h1>{t.userManagement}</h1>
                <button className="add-btn" onClick={openAddForm} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>{t.addUser}</span> <PlusIcon size={18} />
                </button>
            </div>

            <table className="p-table">
                <thead>
                    <tr>
                        <th onClick={() => handleSort("id")} style={{ cursor: "pointer" }}>
                            ID {sortBy === "id" && (sortOrder === "asc" ? "↑" : "↓")}
                        </th>
                        <th onClick={() => handleSort("name")} style={{ cursor: "pointer" }}>
                            {t.name} {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                        </th>
                        <th onClick={() => handleSort("email")} style={{ cursor: "pointer" }}>
                            {t.email} {sortBy === "email" && (sortOrder === "asc" ? "↑" : "↓")}
                        </th>
                        <th onClick={() => handleSort("role")} style={{ cursor: "pointer" }}>
                            {t.role} {sortBy === "role" && (sortOrder === "asc" ? "↑" : "↓")}
                        </th>
                        <th onClick={() => handleSort("status")} style={{ cursor: "pointer" }}>
                            {t.status} {sortBy === "status" && (sortOrder === "asc" ? "↑" : "↓")}
                        </th>
                        <th>{t.actions}</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedUsers.map((u) => (
                        <tr key={u.id}>
                            <td>{u.id}</td>
                            <td>{u.name}</td>
                            <td>{u.email}</td>
                            <td>{t[u.role.toLowerCase()] || u.role}</td>
                            <td>
                                <span className={`status-s status-${u.status === "active" ? "g" : "r"}`}>
                                    {t[u.status] || u.status}
                                </span>
                            </td>
                            <td>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <button className="edit-btn" onClick={() => openEditForm(u)} title="Edit User">
                                        <EditIcon />
                                    </button>
                                    <button className="delete-btn" onClick={() => handleDelete(u.id)} title="Delete User">
                                        <TrashIcon />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {(!users || users.length === 0) && (
                <EmptyState
                    icon={<UsersIcon size={64} />}
                    title={t.noUsersFound}
                    message={t.noUsersMsg}
                    actionText={t.addFirstUser}
                    onAction={openAddForm}
                />
            )}

            {showForm && (
                <div className="form-overlay" onClick={closeForm}>
                    <div className="form-card" onClick={(e) => e.stopPropagation()}>
                        <h3>{editingUser ? t.editStaff : t.addStaff}</h3>

                        <form onSubmit={handleSubmit} className="user-form">
                            <div className="form-group">
                                <label>{t.userId} ({t.admin})</label>
                                <input
                                    type="text"
                                    value={editingUser ? editingUser.id : nextId()}
                                    disabled
                                    className="disabled-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>{t.fullName}</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder={t.enterFullName}
                                />
                            </div>

                            <div className="form-group">
                                <label>{t.email}</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder={t.enterEmail}
                                />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div className="form-group">
                                    <label>{t.role}</label>
                                    <select name="role" value={formData.role} onChange={handleChange}>
                                        <option value="Admin">{t.admin}</option>
                                        <option value="Sales">{t.sales}</option>
                                        <option value="Manager">{t.manager}</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>{t.status}</label>
                                    <select name="status" value={formData.status} onChange={handleChange}>
                                        <option value="active">{t.active}</option>
                                        <option value="inactive">{t.inactive}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn-primary-thematic" disabled={isSubmitting}>
                                    {isSubmitting ? t.processing : editingUser ? t.updateStaff : t.addStaff}
                                </button>
                                <button type="button" className="btn-secondary-thematic" onClick={closeForm} disabled={isSubmitting}>
                                    {t.cancel}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmOpen}
                title={t.removeStaffTitle}
                message={t.removeStaffMsg}
                onConfirm={confirmDelete}
                onCancel={() => setConfirmOpen(false)}
                confirmText={t.removeUser}
                type="danger"
            />

            <Toast
                show={toast.show}
                message={toast.message}
                onClose={() => setToast({ ...toast, show: false })}
            />
        </div>
    );
}
