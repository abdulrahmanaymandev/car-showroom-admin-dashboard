import "./StatCard.css"

export default function StatCard({ title, value, icon }) {
    return (
        <div className="stat-card">
            <div className="stat-card-header">
                <p className="stat-card-title">{title}</p>
                {icon && <div className="stat-card-icon">{icon}</div>}
            </div>
            <h2 className="stat-card-value">{value}</h2>
        </div>
    )
}