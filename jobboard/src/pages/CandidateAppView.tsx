/* CandidateAppView.tsx */
import { Link, useNavigate } from "react-router-dom";

export default function CandidateAppView({ app }: { app: any }) {
  const navigate = useNavigate();
  const isInvited = app.status === 'invited';
  const isRejected = app.status === 'rejected';
  
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  // Логика кнопки чата: показываем, если статус не "new" 
  // (значит работодатель проявил активность)
  const canChat = app.status !== 'new';

  return (
    <div style={{ padding: '40px 0', maxWidth: '900px', margin: '0 auto' }}>
      <Link to="/applications" style={{ color: '#666', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
        ← BACK TO MY APPLICATIONS
      </Link>

      <div style={{ marginTop: '30px', display: 'grid', gap: '30px' }}>
        
        {/* 1. ПАНЕЛЬ СТАТУСА (Акцентная) */}
        <div style={{ 
          background: isInvited ? 'linear-gradient(145deg, #064e3b, #022c22)' : (isRejected ? 'linear-gradient(145deg, #450a0a, #1a0505)' : 'linear-gradient(145deg, #0f0f0f, #050505)'), 
          padding: '40px', 
          borderRadius: '32px', 
          textAlign: 'center',
          border: isInvited ? '1px solid #10b981' : (isRejected ? '1px solid #ef4444' : '1px solid #1a1a1a'),
          boxShadow: isInvited ? '0 0 40px rgba(16, 185, 129, 0.1)' : 'none'
        }}>
          <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', color: '#666', letterSpacing: '1px' }}>
            Current Application Status
          </h2>
          <div style={{ 
            fontSize: '42px', 
            fontWeight: '900', 
            color: isInvited ? '#10b981' : (isRejected ? '#ef4444' : '#fff'), 
            marginTop: '15px',
            letterSpacing: '-1px'
          }}>
            {isInvited ? 'You are Invited!' : (isRejected ? 'Declined' : 'Under Review')}
          </div>
          <p style={{ color: '#888', marginTop: '15px', fontSize: '16px', maxWidth: '500px', margin: '15px auto 0' }}>
            {isInvited 
              ? 'Great news! The employer has reviewed your application and wants to start a conversation.' 
              : (isRejected ? 'Thank you for your interest. Unfortunately, the company decided to move forward with other candidates.' : 'Your application is currently being reviewed by the hiring team.')}
          </p>
        </div>

        {/* 2. ИНФО О ВАКАНСИИ (С ЛОГО) */}
        <div style={{ 
          background: 'linear-gradient(145deg, #0f0f0f, #050505)', 
          padding: '40px', 
          borderRadius: '32px', 
          border: '1px solid #1a1a1a',
          display: 'flex',
          gap: '30px',
          alignItems: 'center'
        }}>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '20px', 
            background: '#000', border: '1px solid #222', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', overflow: 'hidden' 
          }}>
            {app.job.companyLogo ? (
              <img src={`${apiUrl}${app.job.companyLogo}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '24px', fontWeight: 800, color: '#333' }}>{app.job.companyName[0]}</span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>{app.job.title}</h3>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '8px' }}>
              <span style={{ color: '#10b981', fontWeight: 700 }}>{app.job.companyName}</span>
              <span style={{ color: '#444' }}>•</span>
              <span style={{ color: '#666' }}>{app.job.salaryFrom} - {app.job.salaryTo} PLN</span>
            </div>
          </div>
          <Link to={`/jobs/${app.job.id}`} className="btn pill" style={{ textDecoration: 'none', color: '#fff', fontSize: '13px' }}>View Offer</Link>
        </div>

        {/* 3. КОНТЕНТ: COVER LETTER И ФАЙЛЫ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '25px' }}>
          
          {/* Сопроводительное */}
          <div style={{ background: '#0a0a0a', padding: '30px', borderRadius: '24px', border: '1px solid #1a1a1a' }}>
            <div style={{ fontSize: '11px', color: '#444', fontWeight: 800, textTransform: 'uppercase', marginBottom: '20px' }}>Your Motivation Letter</div>
            <p style={{ margin: 0, color: '#aaa', lineHeight: '1.7', fontSize: '15px', fontStyle: app.coverLetter ? 'normal' : 'italic' }}>
              {app.coverLetter ? `"${app.coverLetter}"` : "No message provided."}
            </p>
          </div>

          {/* Резюме и Сообщения */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
             <div style={{ background: '#0a0a0a', padding: '30px', borderRadius: '24px', border: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#444', fontWeight: 800, marginBottom: '5px' }}>ATTACHED CV</div>
                  <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>{app.cvUrl ? "Resume_CV.pdf" : "None"}</div>
                </div>
                {app.cvUrl && <a href={`${apiUrl}${app.cvUrl}`} target="_blank" rel="noreferrer" style={{ fontSize: '20px' }}>📄</a>}
             </div>

             {/* КНОПКА ЧАТА */}
             {canChat ? (
               <button 
                onClick={() => navigate(`/messages/${app.id}`)}
                className="btn btnPrimary pill" 
                style={{ width: '100%', padding: '20px', fontSize: '16px', fontWeight: 800, boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' }}
               >
                 Open Messages 💬
               </button>
             ) : (
               <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dotted #222', color: '#444', fontSize: '13px' }}>
                 Chat will be available once the employer reviews your application
               </div>
             )}
          </div>

        </div>

      </div>
    </div>
  );
}