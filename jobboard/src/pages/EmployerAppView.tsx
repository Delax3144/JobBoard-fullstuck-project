/* EmployerAppView.tsx */
import { Link, useNavigate } from "react-router-dom";

export default function EmployerAppView({ app, updateStatus }: { app: any, updateStatus: (s: string) => void }) {
  const navigate = useNavigate();
  // URL бэкенда для картинок и файлов
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  // Статусы для стилизации
  const isInvited = app.status === 'invited';
  const isRejected = app.status === 'rejected';

  return (
    <div style={{ padding: '40px 0', maxWidth: '900px', margin: '0 auto', color: '#fff' }}>
      <Link to="/employer" style={{ color: '#666', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
        ← BACK TO DASHBOARD
      </Link>
      
      <div style={{ marginTop: '30px', display: 'grid', gap: '30px' }}>
        
        {/* 1. ГЛАВНАЯ КАРТОЧКА КАНДИДАТА С ДЕЙСТВИЯМИ */}
        <div style={{ 
          background: 'linear-gradient(145deg, #0f0f0f, #050505)', 
          padding: '40px', 
          borderRadius: '32px', 
          border: '1px solid #1a1a1a',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
              
              {/* Исправленный блок АВАТАРА КАНДИДАТА */}
              <div style={{ 
                width: '90px', height: '90px', borderRadius: '24px', 
                background: '#111', border: '1px solid #222', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', overflow: 'hidden' 
              }}>
                {app.candidate.avatarUrl ? (
                  <img 
                    src={`${apiUrl}${app.candidate.avatarUrl}`} 
                    alt="avatar" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <span style={{ fontSize: '32px', fontWeight: 800, color: '#333' }}>
                    {app.candidate.firstName?.[0] || app.candidate.email[0].toUpperCase()}
                  </span>
                )}
              </div>
              
              {/* Данные кандидата и вакансии */}
              <div>
                <h1 style={{ fontSize: '32px', fontWeight: 900, margin: 0, letterSpacing: '-1px' }}>
                  {app.candidate.firstName} {app.candidate.lastName}
                </h1>
                <p style={{ color: '#10b981', fontSize: '16px', margin: '5px 0 10px 0', fontWeight: 500 }}>
                  {app.candidate.email}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#444', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Applied For
                    </div>
                    <Link to={`/jobs/${app.job.id}`} style={{color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: 600}}>
                        {app.job.title}
                    </Link>
                </div>
              </div>
            </div>

            {/* Стилизованный СТАТУС-БЕЙДЖ */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: '#444', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                Status
              </div>
              <span style={{ 
                background: isInvited ? 'rgba(16,185,129,0.1)' : (isRejected ? 'rgba(239,68,68,0.1)' : '#111'),
                color: isInvited ? '#10b981' : (isRejected ? '#ef4444' : '#fff'),
                padding: '8px 18px', borderRadius: '12px', fontWeight: 800, fontSize: '12px', border: '1px solid currentColor'
              }}>
                {app.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* 2. БЛОК С COVER LETTER И CV */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px', marginTop: '40px' }}>
            
            {/* Текст письма */}
            <div style={{ 
                padding: '30px', background: 'rgba(0,0,0,0.3)', 
                borderRadius: '24px', border: '1px solid rgba(255,255,255,0.02)' 
            }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#10b981', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Candidate's Cover Letter
                </h4>
                <p style={{ lineHeight: '1.8', color: '#aaa', fontSize: '15px', margin: 0, whiteSpace: 'pre-wrap', fontStyle: app.coverLetter ? 'normal' : 'italic' }}>
                    {app.coverLetter || "No cover letter provided."}
                </p>
            </div>

            {/* Блок CV и Действий */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                {/* Ссылка на CV (Исправленная) */}
                <div style={{ background: '#0a0a0a', padding: '25px', borderRadius: '24px', border: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '11px', color: '#444', fontWeight: 800, marginBottom: '5px' }}>ATTACHED CV</div>
                        <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>{app.cvUrl ? "Resume_CV.pdf" : "None"}</div>
                    </div>
                    {app.cvUrl && (
                        <a 
                            href={`${apiUrl}${app.cvUrl}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            style={{ fontSize: '20px', textDecoration: 'none' }}
                        >
                            📄
                        </a>
                    )}
                </div>

                {/* КНОПКИ УПРАВЛЕНИЯ СТАТУСОМ (Показываем только если статус "new") */}
                {app.status === 'new' ? (
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button 
                            className="btn btnPrimary pill" 
                            onClick={() => updateStatus('invited')} 
                            style={{ flex: 2, padding: '16px', fontWeight: 800 }}
                        >
                            Invite
                        </button>
                        <button 
                            className="btn pill" 
                            onClick={() => updateStatus('rejected')} 
                            style={{ flex: 1, border: '1px solid #ef4444', color: '#ef4444', background: 'transparent' }}
                        >
                            Reject
                        </button>
                    </div>
                ) : (
                    // Показываем пояснение, если решение уже принято
                    <div style={{ 
                        padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', 
                        borderRadius: '20px', border: '1px dotted #222', color: '#444', fontSize: '13px' 
                    }}>
                        {isInvited ? "Candidate is Shortlisted" : "Candidate is Declined"}
                    </div>
                )}
            </div>
          </div>

        </div>

        {/* 3. КНОПКА ОТКРЫТИЯ ЧАТА (Внизу, акцентная) */}
        <button 
          onClick={() => navigate(`/messages/${app.id}`)}
          style={{ 
            background: 'linear-gradient(145deg, #111, #000)', 
            padding: '25px', 
            borderRadius: '24px', 
            textAlign: 'center', 
            cursor: 'pointer',
            color: '#10b981', 
            fontWeight: '800', 
            fontSize: '16px',
            border: '1px solid #222',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            transition: '0.3s'
          }}
          // Эффект наведения
          onMouseOver={(e) => e.currentTarget.style.borderColor = '#10b981'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = '#222'}
        >
          <span>💬</span> Open Chat with {app.candidate.firstName || "Candidate"}
        </button>

      </div>
    </div>
  );
}