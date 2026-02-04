import "./EmptyState.css";

export default function EmptyState({ icon, title, message, actionText, onAction }) {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">{icon}</div>
            <h3 className="empty-state-title">{title}</h3>
            <p className="empty-state-message">{message}</p>
            {actionText && onAction && (
                <button className="empty-state-action" onClick={onAction}>
                    {actionText}
                </button>
            )}
        </div>
    );
}
