import { Link } from "react-router-dom";
import { clearApplications, loadApplications } from "../lib/applicationsStorage";

export default function Applications() {
  const apps = loadApplications();

  return (
    <div>
      <h1>Мои отклики</h1>

      {apps.length === 0 ? (
        <p style={{ opacity: 0.85 }}>
          Пока пусто. Перейди в <Link to="/jobs">Jobs</Link> и отправь отклик.
        </p>
      ) : (
        <>
          <p style={{ opacity: 0.85 }}>Всего: {apps.length}</p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
            <button
              onClick={() => {
                clearApplications();
                window.location.reload();
              }}
              style={{
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid #444",
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              Очистить
            </button>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {apps.map((a) => (
              <div
                key={a.id}
                style={{
                  border: "1px solid #444",
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{a.jobTitle}</div>
                    <div style={{ opacity: 0.85, marginTop: 4 }}>
                      {a.name} • {a.email}
                    </div>
                  </div>

                  <div style={{ opacity: 0.75, fontSize: 13 }}>
                    {new Date(a.createdAt).toLocaleString()}
                  </div>
                </div>

                <p style={{ marginTop: 12, lineHeight: 1.6, opacity: 0.9 }}>{a.message}</p>

                <Link to={`/jobs/${a.jobId}`} style={{ textDecoration: "none" }}>
                  Перейти к вакансии →
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}