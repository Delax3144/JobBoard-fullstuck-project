import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div style={{ background: 'transparent' }}>
      
      {/* SECTION 1: HERO */}
      <section style={{
        position: 'relative',
        padding: '100px 0 50px 0',
        overflow: 'hidden',
        background: 'transparent' // Сетку убрали, фон прозрачный, чтобы видеть глобальную сетку
      }}>
        
        {/* Мягкое зеленое свечение в центре для глубины */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.2fr 1fr', 
          gap: '40px', 
          alignItems: 'center', 
          position: 'relative', 
          zIndex: 1 
        }}>
          
          {/* Левая часть (Текст) */}
          <div style={{ textAlign: 'left' }}>
            <div style={{
              display: 'inline-block',
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '24px',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              Future of IT Recruitment
            </div>

            <h1 style={{
              fontSize: 'clamp(36px, 5vw, 64px)',
              fontWeight: '800',
              lineHeight: '1.1',
              marginBottom: '24px',
              letterSpacing: '-0.02em',
              color: '#fff'
            }}>
              Find your next <br />
              <span style={{
                background: 'linear-gradient(90deg, #10b981, #34d399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>dream job</span> in tech
            </h1>

            <p style={{
              fontSize: '18px',
              color: '#999',
              maxWidth: '480px',
              marginBottom: '40px',
              lineHeight: '1.6'
            }}>
              Connect with top tech companies. Chat directly with employers and manage your career in one place.
            </p>

            <div style={{ display: 'flex', gap: '16px' }}>
              <Link to="/jobs" className="btn btnPrimary" style={{ 
                padding: '14px 28px', 
                fontSize: '16px',
                boxShadow: '0 10px 30px rgba(16, 185, 129, 0.2)' 
              }}>
                Browse Jobs
              </Link>
              {!user && (
                <Link to="/register" className="btn" style={{ 
                  padding: '14px 28px', 
                  fontSize: '16px',
                  border: '1px solid #333',
                  background: 'transparent'
                }}>
                  Join Now
                </Link>
              )}
            </div>
          </div>

          {/* Правая часть (Картинка) */}
          <div style={{ position: 'relative' }}>
            {/* Дополнительное свечение за самой картинкой */}
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
              filter: 'blur(40px)',
              zIndex: -1
            }} />
            
            <img 
              src="/images/hero-coder.png" 
              className="floating-image" 
              style={{
                width: '100%',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'block'
              }}
            />
          </div>
        </div>
      </section>

      {/* SECTION 2: BENTO GRID */}
      <section style={{ padding: '0 0 80px 0', position: 'relative', zIndex: 1 }}>
        <div className="container">
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: '32px', 
            marginBottom: '50px', 
            fontWeight: '700',
            opacity: 0.9 
          }}>
            Everything you need to <span style={{ color: '#10b981' }}>get hired</span>
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(2, 200px)',
            gap: '20px',
            maxWidth: '1100px',
            margin: '0 auto'
          }}>
            
            {/* КАРТОЧКА 1: БОЛЬШАЯ (Чат) */}
            <div className="bento-card" style={{
              gridColumn: '1 / 3',
              gridRow: '1 / 3',
              background: 'linear-gradient(145deg, #1a1a1a, #111)',
              borderRadius: '24px',
              padding: '40px',
              border: '1px solid rgba(255,255,255,0.05)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <h3 style={{ fontSize: '24px', margin: '0 0 10px 0' }}>Direct Communication</h3>
                <p style={{ color: '#888', maxWidth: '300px', lineHeight: '1.5' }}>
                  Skip the middleman. Chat directly with technical recruiters and managers in real-time.
                </p>
              </div>
              
              {/* Декоративный чат */}
              <div style={{
                position: 'absolute',
                right: '-20px',
                bottom: '20px',
                width: '240px',
                background: '#0a0a0a',
                borderRadius: '16px',
                padding: '15px',
                transform: 'rotate(-5deg)',
                border: '1px solid #333',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
              }}>
                <div style={{ background: '#10b981', width: '70%', height: '8px', borderRadius: '4px', marginBottom: '8px' }} />
                <div style={{ background: '#222', width: '90%', height: '8px', borderRadius: '4px', marginBottom: '15px' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ background: '#333', flex: 1, height: '24px', borderRadius: '12px' }} />
                  <div style={{ background: '#10b981', width: '40px', height: '24px', borderRadius: '12px' }} />
                </div>
              </div>
            </div>

            {/* КАРТОЧКА 2: LIVE UPDATES */}
            <div className="bento-card" style={{
              gridColumn: '3 / 4',
              gridRow: '1 / 2',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '24px',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <div className="pulse-dot" style={{ 
                width: '12px', height: '12px', 
                background: '#10b981', borderRadius: '50%', 
                marginBottom: '15px', boxShadow: '0 0 15px #10b981' 
              }} />
              <h4 style={{ margin: '0 0 5px 0' }}>Live Updates</h4>
              <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Instant notifications on application status.</p>
            </div>

            {/* КАРТОЧКА 3: ТЕК-СТЕК */}
            <div className="bento-card" style={{
              gridColumn: '3 / 4',
              gridRow: '2 / 3',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '24px',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.05)',
              overflow: 'hidden'
            }}>
              <h4 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>Filter by Stack</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['React', 'Node.js', 'Python', 'TS', 'Docker', 'AWS'].map(tag => (
                  <span key={tag} style={{ 
                    fontSize: '10px', 
                    padding: '4px 8px', 
                    borderRadius: '6px', 
                    background: '#1a1a1a', 
                    color: '#10b981',
                    border: '1px solid rgba(16, 185, 129, 0.2)'
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}