import React, { useEffect } from 'react';
import './Toast.css';
import { CheckIcon, ErrorIcon, XIcon } from './Icons';

const Toast = ({ show, message, type = 'success', onClose }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    return (
        <div className={`toast-notification ${type}`}>
            <div className="toast-content">
                <span className="toast-icon">
                    {type === 'success' ? <CheckIcon /> : <ErrorIcon />}
                </span>
                <span className="toast-message">{message}</span>
            </div>
            <button className="toast-close" onClick={onClose}><XIcon size={16} /></button>
        </div>
    );
};

export default Toast;
