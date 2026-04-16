import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footerInner">
        <div style={{ maxWidth: '300px' }}>
          <Link to="/" className="footerLogo">Job<span style={{ color: '#10b981' }}>Board</span></Link>
          <p style={{ color: '#666', fontSize: '14px', marginTop: '15px', lineHeight: '1.6' }}>
            The best platform to find tech jobs and connect with top employers worldwide.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '60px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <b style={{ color: '#fff', fontSize: '14px', marginBottom: '8px' }}>Platform</b>
            <Link to="/jobs" className="footerLink" style={{ color: '#666', textDecoration: 'none' }}>Browse Jobs</Link>
            <Link to="/applications" className="footerLink" style={{ color: '#666', textDecoration: 'none' }}>My Applications</Link>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <b style={{ color: '#fff', fontSize: '14px', marginBottom: '8px' }}>Company</b>
            <Link to="/about" className="footerLink" style={{ color: '#666', textDecoration: 'none' }}>About Us</Link>
            <Link to="/" className="footerLink" style={{ color: '#666', textDecoration: 'none' }}>Contact</Link>
          </div>
        </div>
      </div>

      <div className="footerCopyright" style={{ textAlign: 'center', marginTop: '60px', color: '#444', fontSize: '12px' }}>
        © {new Date().getFullYear()} JobBoard. Built with love for developers.
      </div>
    </footer>
  );
}