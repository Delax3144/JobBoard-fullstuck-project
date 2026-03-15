import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <h1 className="h1">Find your next developer job</h1>

      <p className="p">
        Реалистичный Job Board проект. Поиск вакансий, отклики, фильтры —
        всё как в настоящем продукте.
      </p>

      <div style={{ marginTop: 24 }}>
        <Link to="/jobs" style={{ textDecoration: "none" }}>
          <button className="btn btnPrimary">
            Смотреть вакансии →
          </button>
        </Link>
      </div>

      <div
        style={{
          marginTop: 40,
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        }}
      >
        <div className="panel">
          <h3>Поиск</h3>
          <p className="small">
            Фильтры по локации и быстрый поиск.
          </p>
        </div>

        <div className="panel">
          <h3>Отклики</h3>
          <p className="small">
            Отправка отклика через модалку.
          </p>
        </div>

        <div className="panel">
          <h3>UX</h3>
          <p className="small">
            Реальный UI как в production проектах.
          </p>
        </div>
      </div>
    </div>
  );
}