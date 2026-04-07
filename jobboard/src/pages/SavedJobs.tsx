import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function SavedJobs() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedJobs = async () => {
    try {
      const res = await api.get("/bookmarks");
      setSavedJobs(res.data);
    } catch (err) {
      console.error("Error fetching saved jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'candidate') {
      fetchSavedJobs();
    }
  }, [user]);

  const removeBookmark = async (e: React.MouseEvent, jobId: string) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await api.post(`/bookmarks/${jobId}`);
      // Сразу убираем вакансию из списка на фронте
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (err) {
      console.error("Error removing bookmark:", err);
    }
  };

  if (!user || user.role !== 'candidate') {
    return <div style={{ color: '#fff', padding: '100px', textAlign: 'center' }}>Access Denied</div>;
  }

  return (
    <div style={{ padding: '40px 0', minHeight: '100vh', color: '#fff' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '800', margin: 0, letterSpacing: '-1px' }}>
            Saved <span style={{ color: '#10b981' }}>Opportunities</span>
          </h1>
          <p style={{ color: '#666', marginTop: '10px' }}>
            You have {savedJobs.length} bookmarked {savedJobs.length === 1 ? 'job' : 'jobs'}
          </p>
        </div>

        {loading ? (
          <div style={{ color: '#666', textAlign: 'center', padding: '50px' }}>Loading your bookmarks...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {savedJobs.map((job) => (
              <Link to={`/jobs/${job.id}`} key={job.id} style={{ textDecoration: 'none' }}>
                <div className="job-card" style={{ display: 'flex', gap: '20px', alignItems: 'center', position: 'relative' }}>
                  
                  <div style={{ width: '60px', height: '60px', minWidth: '60px', borderRadius: '14px', background: '#000', border: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {job.companyLogo ? (
                      <img 
                        src={job.companyLogo?.startsWith('http') ? job.companyLogo : `${apiUrl}${job.companyLogo}`}
                        alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <span style={{ fontSize: '24px', fontWeight: 800, color: '#333' }}>{job.companyName[0]}</span>
                    )}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <h3 style={{ margin: 0, fontSize: '20px', color: '#fff', paddingRight: '40px' }}>{job.title}</h3>
                      <span style={{ color: '#10b981', fontWeight: '700', fontSize: '18px' }}>
                        {job.salaryFrom} - {job.salaryTo} <span style={{ fontSize: '12px', opacity: 0.5 }}>PLN</span>
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
                      <span style={{ color: '#888', fontSize: '14px' }}>{job.companyName}</span>
                      <span style={{ width: '4px', height: '4px', background: '#333', borderRadius: '50%' }} />
                      <span style={{ color: '#888', fontSize: '14px' }}> {job.location}</span>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => removeBookmark(e, job.id)}
                    style={{ position: 'absolute', top: '15px', left: '70px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px', zIndex: 10, transition: 'transform 0.2s', transform: 'scale(1.1)' }}
                    title="Remove from Saved"
                  >
                    ❤️
                  </button>

                </div>
              </Link>
            ))}

            {savedJobs.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#111', borderRadius: '24px', border: '1px solid #222' }}>
                <div style={{ fontSize: '40px', marginBottom: '15px' }}>📭</div>
                <h3 style={{ margin: '0 0 10px', color: '#fff' }}>No saved jobs yet</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Click the heart icon on any job to save it for later.</p>
                <Link to="/jobs" className="btn btnPrimary" style={{ display: 'inline-block', marginTop: '20px', textDecoration: 'none' }}>Browse Jobs</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}