import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div>
      <h1>404 — Страница не найдена</h1>
      <p style={{ opacity: 0.8 }}>
        Похоже, такого адреса нет. Вернись на главную или к списку вакансий.
      </p>

      <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link to="/" style={{ textDecoration: "none" }}>
          ← Home
        </Link>
        <Link to="/jobs" style={{ textDecoration: "none" }}>
          Jobs →
        </Link>
      </div>
    </div>
  );
}