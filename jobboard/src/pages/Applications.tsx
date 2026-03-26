import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";

interface Application {
  id: string;
  jobId: string;
  coverLetter: string;
  status: string; 
  createdAt: string;
  lastViewedByCandidate: string; // Время последнего захода в детали
  messages: any[]; // Список сообщений для проверки даты последнего
  job: {
    title: string;
    companyName: string;
  };
}

export default function Applications() {
  const [apps, setApps] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Загружаем отклики. Бэкенд теперь возвращает расширенные данные (сообщения и даты просмотра)
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
            {apps.map((a) => {
              // ЛОГИКА УВЕДОМЛЕНИЙ:
              // Сравниваем дату последнего сообщения (или создания отклика) с датой, когда кандидат заходил на страницу
              const lastEventTime = a.messages?.[0]?.createdAt || a.createdAt;
              const hasUpdate = lastEventTime > a.lastViewedByCandidate || (a.status === 'invited' && lastEventTime > a.lastViewedByCandidate);

              return (
                <div
                  key={a.id}
                  className="card"
                  style={{
                    border: "1px solid #444",
                    borderRadius: 12,
                    padding: 16,
                    position: 'relative', // Нужно для позиционирования точки
                  }}
                >
                  {/* МИГАЮЩАЯ ТОЧКА УВЕДОМЛЕНИЯ */}
                  {hasUpdate && (
                    <div 
                      className="pulse-dot"
                      style={{
                        position: 'absolute',
                        top: 15,
                        right: 15,
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: '#10b981',
                        boxShadow: '0 0 10px #10b981'
                      }} 
                    />
                  )}

                  {/* БЛОК СТАТУСА */}
                  <div style={{ marginBottom: 15 }}>
                    {a.status === 'invited' && (
                      <div style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: 12, borderRadius: 8 }}>
                        <b>Вас пригласили!</b>
                        <p style={{ margin: '4px 0 0 0', fontSize: 14 }}>Работодатель заинтересован. Загляните в детали, чтобы начать общение.</p>
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
                    <Link 
                      to={`/applications/${a.id}`} 
                      style={{ 
                        textDecoration: "none", 
                        color: "#10b981", 
                        fontSize: 14, 
                        fontWeight: 'bold',
                        borderBottom: '1px solid #10b981'
                      }}
                    >
                      Открыть чат и детали →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}