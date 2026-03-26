import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function ApplicationDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [app, setApp] = useState<any>(null);
  const [msg, setMsg] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchApp = async () => {
    try {
      const res = await api.get(`/applications/${id}`);
      setApp(res.data);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error("Ошибка загрузки:", err);
    }
  };

  useEffect(() => { 
    fetchApp();
    const interval = setInterval(fetchApp, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    try {
      await api.patch(`/applications/${id}/status`, { status: newStatus });
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
      {/* Кнопка Назад */}
      <Link to={isEmployer ? "/employer" : "/applications"} style={{ color: '#aaa', textDecoration: 'none' }}>← Назад</Link>
      
      {/* Заголовок */}
      <h1 style={{ marginTop: 20 }}>Отклик от {app.candidate.email}</h1>
      
      {/* Панель статуса */}
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

        {/* Кнопки для работодателя */}
        {isEmployer && app.status === 'new' && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btnPrimary" onClick={() => updateStatus('invited')} style={{ background: '#10b981', border: 'none' }}>
              Пригласить
            </button>
            <button className="btn" onClick={() => updateStatus('rejected')} style={{ borderColor: '#ff6b6b', color: '#ff6b6b' }}>
              Отклонить
            </button>
          </div>
        )}
      </div>

      {/* Зеленое сообщение для кандидата */}
      {!isEmployer && app.status === 'invited' && (
        <div style={{ background: 'rgba(16,185,129,0.1)', padding: 15, borderRadius: 12, marginBottom: 20, border: '1px solid #10b981' }}>
          <b style={{ color: '#10b981' }}>Вас пригласили!</b>
          <p style={{ margin: '5px 0 0 0', opacity: 0.8 }}>Работодатель заинтересован в вашей кандидатуре. Вы можете обсудить детали в чате ниже.</p>
        </div>
      )}

      {/* Карта с письмом */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h4>Сопроводительное письмо:</h4>
        <p style={{ whiteSpace: 'pre-wrap', opacity: 0.9 }}>{app.coverLetter || "Письмо отсутствует"}</p>
      </div>

      {/* === ОБНОВЛЕННЫЙ СУЖЕННЫЙ БЛОК ЧАТА === */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 30, marginBottom: 30 }}>
        <div className="card" style={{ 
          width: '100%', 
          maxWidth: '650px', // Установили максимальную ширину
          padding: '20px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)', // Добавили мягкую тень
          border: '1px solid #2a2a2a'
        }}>
          <h4 style={{ marginTop: 0, marginBottom: 20, textAlign: 'center', opacity: 0.7 }}>
            Чат с {isEmployer ? "кандидатом" : "работодателем"}
          </h4>
          
          <div style={{ 
            height: 350, // Немного увеличили высоту
            overflowY: 'auto', 
            padding: '15px', // Увеличили внутренний отступ
            background: '#111', // Сделали фон чата чуть темнее карточки
            borderRadius: 8, 
            marginBottom: 15,
            border: '1px solid #222'
          }}>
            {app.messages.map((m: any) => (
              <div key={m.id} style={{ 
                textAlign: m.senderId === user?.id ? 'right' : 'left', 
                marginBottom: 15 // Увеличили отступ между сообщениями
              }}>
                <div style={{ 
                  display: 'inline-block', 
                  padding: '10px 16px', // Более комфортные отступы внутри "пузыря"
                  borderRadius: '16px',
                  // Логика скругления углов (стиль мессенджеров)
                  borderBottomRightRadius: m.senderId === user?.id ? '4px' : '16px',
                  borderBottomLeftRadius: m.senderId === user?.id ? '16px' : '4px',
                  backgroundColor: m.senderId === user?.id ? '#10b981' : '#2a2a2a', 
                  color: m.senderId === user?.id ? '#000' : '#fff',
                  fontSize: 14,
                  fontWeight: m.senderId === user?.id ? '600' : '400',
                  lineHeight: '1.4'
                }}>
                  {m.text}
                </div>
                {/* Время сообщения */}
                <div style={{ fontSize: '10px', opacity: 0.4, marginTop: '4px', padding: '0 4px' }}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
            
            {app.messages.length === 0 && (
              <p style={{ opacity: 0.4, textAlign: 'center', marginTop: '120px', fontSize: 14 }}>
                {isEmployer ? "Напишите первым, чтобы начать диалог." : "Сообщений пока нет."}
              </p>
            )}
          </div>

          {/* Поле ввода */}
          <div style={{ display: 'flex', gap: 10 }}>
            <input 
              className="input" 
              value={msg} 
              onChange={e => setMsg(e.target.value)} 
              placeholder={
                !isEmployer && app.messages.length === 0 && app.status === 'new' 
                ? "Подождите, пока работодатель напишет первым..." 
                : "Введите сообщение..."
              }
              disabled={!isEmployer && app.messages.length === 0 && app.status === 'new'}
              onKeyDown={(e) => e.key === 'Enter' && sendMsg()}
              style={{ flex: 1 }}
            />
            <button 
              className="btn btnPrimary" 
              onClick={sendMsg}
              disabled={!isEmployer && app.messages.length === 0 && app.status === 'new'}
              style={{ padding: '0 25px' }} // Сделали кнопку чуть шире
            >
              Отправить
            </button>
          </div>
        </div>
      </div>
      {/* === КОНЕЦ БЛОКА ЧАТА === */}

    </div>
  );
}