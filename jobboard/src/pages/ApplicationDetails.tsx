import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function ApplicationDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [app, setApp] = useState<any>(null);
  const [msg, setMsg] = useState("");

  const fetchApp = async () => {
    try {
      const res = await api.get(`/applications/${id}`);
      setApp(res.data);
    } catch (err) {
      console.error("Ошибка загрузки:", err);
    }
  };

  useEffect(() => { fetchApp(); }, [id]);

// ФУНКЦИЯ СМЕНЫ СТАТУСА
  const updateStatus = async (newStatus: string) => {
    try {
      await api.patch(`/applications/${id}/status`, { status: newStatus });
      // После обновления статуса перегружаем данные, чтобы увидеть изменения
      fetchApp(); 
    } catch (err) {
      alert("Не удалось обновить статус");
    }
  };

  const sendMsg = async () => {
    if (!msg.trim()) return;
    try {
      await api.post(`/applications/${id}/messages`, { text: msg });
      setMsg("");
      fetchApp();
    } catch (err: any) {
      alert(err.response?.data?.message || "Ошибка отправки");
    }
  };

  if (!app) return <div className="container">Загрузка...</div>;

  const isEmployer = user?.role === 'employer';

  return (
    <div className="container">
      <Link to={isEmployer ? "/employer" : "/applications"} style={{ color: '#aaa', textDecoration: 'none' }}>← Назад</Link>
      
      <h1 style={{ marginTop: 20 }}>Отклик от {app.candidate.email}</h1>
      
      <div className="panel" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0 }}>{app.job.title}</h3>
          <p style={{ margin: '5px 0' }}>Текущий статус: 
            <b style={{ 
              marginLeft: 8,
              color: app.status === 'invited' ? '#10b981' : app.status === 'rejected' ? '#ff6b6b' : '#3b82f6' 
            }}>
              {app.status.toUpperCase()}
            </b>
          </p>
        </div>

        {/* КНОПКИ УПРАВЛЕНИЯ ДЛЯ РАБОТОДАТЕЛЯ */}
        {isEmployer && app.status === 'new' && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button 
              className="btn btnPrimary" 
              onClick={() => updateStatus('invited')}
              style={{ background: '#10b981', border: 'none' }}
            >
              Пригласить
            </button>
            <button 
              className="btn" 
              onClick={() => updateStatus('rejected')}
              style={{ borderColor: '#ff6b6b', color: '#ff6b6b' }}
            >
              Отклонить
            </button>
          </div>
        )}
      </div>
      {/* Сообщение для кандидата, если статус изменился */}
      {!isEmployer && app.status === 'invited' && (
        <div style={{ background: 'rgba(16,185,129,0.1)', padding: 15, borderRadius: 12, marginBottom: 20, border: '1px solid #10b981' }}>
          <b style={{ color: '#10b981' }}>🎉 Вас пригласили!</b>
          <p style={{ margin: '5px 0 0 0', opacity: 0.8 }}>Работодатель заинтересован в вашей кандидатуре. Вы можете обсудить детали в чате ниже.</p>
        </div>
      )}

      <div className="card" style={{ marginBottom: 20 }}>
        <h4>Сопроводительное письмо:</h4>
        <p style={{ whiteSpace: 'pre-wrap', opacity: 0.9 }}>{app.coverLetter}</p>
      </div>

      <div className="card">
        <h4>Чат с {isEmployer ? "кандидатом" : "работодателем"}</h4>
        <div style={{ height: 300, overflowY: 'auto', padding: 10, background: '#1a1a1a', borderRadius: 8, marginBottom: 15 }}>
          {app.messages.map((m: any) => (
            <div key={m.id} style={{ textAlign: m.senderId === user?.id ? 'right' : 'left', marginBottom: 10 }}>
              <div style={{ 
                display: 'inline-block', 
                padding: '8px 12px', 
                borderRadius: 12, 
                background: m.senderId === user?.id ? '#10b981' : '#333',
                fontSize: 14
              }}>
                {m.text}
              </div>
            </div>
          ))}
          {app.messages.length === 0 && <p style={{ opacity: 0.5, textAlign: 'center' }}>Сообщений пока нет</p>}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <input 
            className="input" 
            value={msg} 
            onChange={e => setMsg(e.target.value)} 
            placeholder="Введите сообщение..." 
            onKeyDown={(e) => e.key === 'Enter' && sendMsg()}
          />
          <button className="btn btnPrimary" onClick={sendMsg}>Отправить</button>
        </div>
      </div>
    </div>
  );
}