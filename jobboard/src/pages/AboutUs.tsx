import { Link } from "react-router-dom";

export default function AboutUs() {
  return (
    <div style={{ color: '#fff', paddingBottom: '100px' }}>
      {/* HERO SECTION */}
      <section style={{ 
        textAlign: 'center', 
        padding: '100px 20px', 
        background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.05) 0%, rgba(10, 10, 10, 1) 100%)' 
      }}>
        <h1 style={{ fontSize: '56px', fontWeight: 900, marginBottom: '20px', letterSpacing: '-2px' }}>
          We Connect <span style={{ color: '#10b981' }}>Talent</span> with <span style={{ color: '#10b981' }}>Opportunity</span>
        </h1>
        <p style={{ fontSize: '20px', color: '#888', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
          JobBoard is more than just a job site. It's a platform designed to empower professionals and help companies build world-class teams.
        </p>
      </section>

      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* MISSION SECTION */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center', marginBottom: '100px' }}>
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '20px' }}>Our Mission</h2>
            <p style={{ color: '#aaa', fontSize: '18px', lineHeight: '1.8' }}>
              Our mission is to simplify the hiring process. We believe that finding a dream job or the perfect candidate shouldn't be a struggle. By leveraging modern technology, we provide a seamless experience for both employers and job seekers.
            </p>
          </div>
          <div style={{ 
            height: '350px', 
            background: '#1a1a1a', 
            borderRadius: '32px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px solid #222'
          }}>
            <span style={{ color: '#444' }}>[ Place for your Image 1 ]</span>
          </div>
        </div>

        {/* VALUES SECTION */}
        <div style={{ marginBottom: '100px' }}>
          <h2 style={{ textAlign: 'center', fontSize: '32px', fontWeight: 800, marginBottom: '50px' }}>Our Core Values</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '30px' }}>
            {[
              { title: 'Transparency', desc: 'Clear communication between candidates and companies.' },
              { title: 'Innovation', desc: 'Continuous improvement of our matching algorithms.' },
              { title: 'Community', desc: 'Supporting the growth of the tech ecosystem.' }
            ].map((value, i) => (
              <div key={i} style={{ padding: '40px', background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: '24px' }}>
                <div style={{ color: '#10b981', fontSize: '24px', marginBottom: '15px' }}>★</div>
                <h3 style={{ marginBottom: '10px' }}>{value.title}</h3>
                <p style={{ color: '#666', lineHeight: '1.5' }}>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* TEAM SECTION (Placeholder) */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '50px' }}>Meet Our Team</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
            {[1, 2, 3].map(member => (
              <div key={member} style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '180px', 
                  height: '180px', 
                  borderRadius: '50%', 
                  background: '#1a1a1a', 
                  marginBottom: '20px',
                  border: '1px solid #222',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ color: '#444' }}>Photo</span>
                </div>
                <h4 style={{ margin: '0 0 5px' }}>Team Member</h4>
                <p style={{ color: '#10b981', fontSize: '14px' }}>Co-founder</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA SECTION */}
        <div style={{ 
          marginTop: '120px', 
          padding: '60px', 
          background: '#10b981', 
          borderRadius: '40px', 
          textAlign: 'center',
          color: '#000' 
        }}>
          <h2 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '20px' }}>Ready to start your journey?</h2>
          <p style={{ fontSize: '18px', fontWeight: 600, marginBottom: '30px', opacity: 0.8 }}>Join thousands of companies and developers today.</p>
          <Link to="/register" className="btn" style={{ background: '#000', color: '#fff', padding: '15px 40px', borderRadius: '14px', textDecoration: 'none', fontWeight: 800 }}>
            Get Started for Free
          </Link>
        </div>

      </div>
    </div>
  );
}