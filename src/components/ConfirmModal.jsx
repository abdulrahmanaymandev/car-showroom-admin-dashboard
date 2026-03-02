import React from 'react';
import './ConfirmModal.css';
import { AlertIcon, InfoIcon } from './Icons';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Delete", cancelText = "Cancel", type = "danger" }) => {
    if (!isOpen) return null;

    return (
        <div className="form-overlay" onClick={onCancel}>
            <div className={`form-card confirm-modal ${type}`} onClick={(e) => e.stopPropagation()}>
                <div className="confirm-icon">
                    {type === "danger" ? <AlertIcon size={48} /> : <InfoIcon size={48} />}
                </div>
                <h3>{title}</h3>
                <p className="confirm-message">{message}</p>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn-secondary-thematic"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        className={type === "danger" ? "btn-danger-thematic" : "btn-primary-thematic"}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
