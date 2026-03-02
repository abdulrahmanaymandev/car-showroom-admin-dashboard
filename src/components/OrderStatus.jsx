import React from "react";
import "./OrderStatus.css";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../data/translations";

function OrderStatus({ orders = [] }) {
  const { lang } = useLanguage();
  const t = translations[lang];

  const total = orders.length;

  const completed = orders.filter((o) => o.status === "completed").length;
  const pending = orders.filter((o) => o.status === "pending").length;
  const cancelled = orders.filter((o) => o.status === "cancelled").length;

  const percent = (count) => {
    if (total === 0) return "0%";
    return `${(count / total) * 100}%`;
  };

  return (
    <div className="orderStatus">
      <span className="orderStatus__title">{t.orderStatus}</span>

      <div className="orderStatus__item">
        <div className="orderStatus__row">
          <span className="orderStatus__label">{t.completed}</span>
          <span className="orderStatus__count">{completed}</span>
        </div>

        <div className="orderStatus__bar">
          <div
            className="orderStatus__fill is-green"
            style={{ width: percent(completed) }}
          />
        </div>
      </div>

      <div className="orderStatus__item">
        <div className="orderStatus__row">
          <span className="orderStatus__label">{t.pending}</span>
          <span className="orderStatus__count">{pending}</span>
        </div>

        <div className="orderStatus__bar">
          <div
            className="orderStatus__fill is-yellow"
            style={{ width: percent(pending) }}
          />
        </div>
      </div>

      <div className="orderStatus__item">
        <div className="orderStatus__row">
          <span className="orderStatus__label">{t.cancelled}</span>
          <span className="orderStatus__count">{cancelled}</span>
        </div>

        <div className="orderStatus__bar">
          <div
            className="orderStatus__fill is-red"
            style={{ width: percent(cancelled) }}
          />
        </div>
      </div>
    </div>
  );
}

export default OrderStatus;
