import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";

export default function Applications() {
  const [apps, setApps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get("/applications/my")
      .then((res) => {
        setApps(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <div style={{ color: '#666', textAlign: 'center', paddingTop: '100px' }}>Loading...</div>;

  return (
    <div style={{ padding: '80px 0', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: '800px' }}> {/* Сузили контент для фокуса */}
        
        <header style={{ marginBottom: '60px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '800', letterSpacing: '-2px', marginBottom: '10px' }}>
            My <span style={{ color: '#10b981' }}>Applications</span>
          </h1>
          <p style={{ color: '#555', fontSize: '18px' }}>Tracking your professional growth</p>
        </header>

        <div style={{ display: 'grid', gap: '24px' }}>
          {apps.map((a) => {
            const lastEventTime = a.messages?.[0]?.createdAt || a.createdAt;
            const hasUpdate = lastEventTime > a.lastViewedByCandidate;
            const isInvited = a.status === 'invited';

            return (
              <Link 
                to={`/applications/${a.id}`} 
                key={a.id} 
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  backdropFilter: 'blur(10px)',
                  border: isInvited ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '24px',
                  padding: '32px',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  boxShadow: isInvited ? '0 0 30px rgba(16, 185, 129, 0.05)' : 'none',
                  cursor: 'pointer'
                }}
                className="app-card-hover"
                >
                  {/* ИНДИКАТОР ОБНОВЛЕНИЯ */}
                  {hasUpdate && (
                    <div style={{
                      position: 'absolute',
                      top: '32px',
                      right: '32px',
                      width: '8px',
                      height: '8px',
                      background: '#10b981',
                      borderRadius: '50%',
                      boxShadow: '0 0 10px #10b981'
                    }} />
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      {/* СТАТУС ТЕКСТОМ */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        fontSize: '12px', 
                        fontWeight: '700', 
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '12px',
                        color: isInvited ? '#10b981' : a.status === 'rejected' ? '#ff6b6b' : '#666'
                      }}>
                        <span style={{ 
                          width: '6px', 
                          height: '6px', 
                          borderRadius: '50%', 
                          background: 'currentColor' 
                        }} />
                        {a.status}
                      </div>

                      <h3 style={{ fontSize: '24px', margin: '0 0 4px 0', fontWeight: '700' }}>{a.job?.title}</h3>
                      <div style={{ color: '#999', fontSize: '16px' }}>{a.job?.companyName}</div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                       <span style={{ color: '#333', fontSize: '13px' }}>
                        {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* КОРОТКОЕ ПРЕВЬЮ ПИСЬМА */}
                  <p style={{ 
                    marginTop: '24px', 
                    color: '#666', 
                    fontSize: '15px', 
                    lineHeight: '1.6',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {a.coverLetter}
                  </p>

                  <div style={{ 
                    marginTop: '24px', 
                    paddingTop: '24px', 
                    borderTop: '1px solid rgba(255,255,255,0.03)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '14px', color: '#10b981', fontWeight: '600' }}>
                      Open Conversation →
                    </span>
                    {isInvited && (
                      <span style={{ fontSize: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 12px', borderRadius: '20px' }}>
                        Action Required
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* СТИЛИ ДЛЯ ХОВЕРА (добавь в CSS если можешь, или оставь так) */}
      <style>{`
        .app-card-hover:hover {
          background: rgba(255, 255, 255, 0.04) !important;
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
      `}</style>
    </div>
  );
}