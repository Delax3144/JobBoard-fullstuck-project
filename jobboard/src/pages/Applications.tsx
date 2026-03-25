import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";

interface Application {
  id: string;
  jobId: string;
  coverLetter: string;
  status: string; // ДОБАВИЛИ СТАТУС В ТИПЫ
  createdAt: string;
  job: {
    title: string;
    companyName: string;
  };
}

export default function Applications() {
  const [apps, setApps] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get("/applications/my")
      .then((res) => {
        setApps(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Ошибка загрузки откликов:", err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <div className="container">Загрузка ваших откликов...</div>;

  return (
    <div className="container">
      <h1>Мои отклики</h1>

      {apps.length === 0 ? (
        <p style={{ opacity: 0.85 }}>
          Пока пусто. Перейди в <Link to="/jobs" style={{ color: "#10b981" }}>Jobs</Link> и отправь свой первый отклик.
        </p>
      ) : (
        <>
          <p style={{ opacity: 0.85, marginBottom: 20 }}>Всего отправлено: {apps.length}</p>

          <div style={{ display: "grid", gap: 12 }}>
            {apps.map((a) => (
              <div
                key={a.id}
                className="card"
                style={{
                  border: "1px solid #444",
                  borderRadius: 12,
                  padding: 16,
                  position: 'relative',
                }}
              >
                {/* БЛОК СТАТУСА (теперь внутри одной карточки) */}
                <div style={{ marginBottom: 15 }}>
                  {a.status === 'invited' && (
                    <div style={{ 
                      position: 'absolute', 
                      top: 10, 
                      right: 10, 
                      backgroundColor: '#10b981', 
                      color: '#000', 
                      fontSize: 10, 
                      fontWeight: 'bold', 
                      padding: '2px 8px', 
                      borderRadius: 20 
                    }}>
                      INVITED
                    </div>
                  )}

                  {a.status === 'rejected' && (
                    <div style={{ color: '#ff6b6b', background: 'rgba(255, 107, 107, 0.1)', padding: 12, borderRadius: 8 }}>
                      К сожалению, работодатель выбрал другого кандидата. Не сдавайтесь!
                    </div>
                  )}

                  {a.status === 'new' && (
                    <div style={{ opacity: 0.6, fontSize: 13 }}>
                      ⏳ На рассмотрении...
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>{a.job?.title || "Вакансия удалена"}</div>
                    <div style={{ opacity: 0.85, marginTop: 4, color: "#10b981" }}>
                      {a.job?.companyName}
                    </div>
                  </div>

                  <div style={{ opacity: 0.6, fontSize: 12 }}>
                    {new Date(a.createdAt).toLocaleString()}
                  </div>
                </div>

                <p style={{ 
                  marginTop: 12, 
                  lineHeight: 1.6, 
                  opacity: 0.9, 
                  backgroundColor: "rgba(255,255,255,0.03)", 
                  padding: 10, 
                  borderRadius: 8,
                  whiteSpace: "pre-wrap" 
                }}>
                  {a.coverLetter}
                </p>

                <div style={{ marginTop: 12, display: 'flex', gap: 15 }}>
                   <Link to={`/jobs/${a.jobId}`} style={{ textDecoration: "none", color: "#10b981", fontSize: 14 }}>
                    Вакансия →
                  </Link>
                  <Link to={`/applications/${a.id}`} style={{ textDecoration: "none", color: "#10b981", fontSize: 14, fontWeight: 'bold' }}>
                    Открыть чат и детали →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}