import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../lib/api";


interface Application {
  id: string;
  coverLetter: string;
  cvUrl?: string | null; // ДОБАВЬ ЭТУ СТРОКУ
  status: "new" | "reviewed" | "invited" | "rejected";
  createdAt: string;
  candidate: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

interface JobDetails {
  id: string;
  title: string;
  companyName: string;
}

export default function JobManagement() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const { id } = useParams(); // ID вакансии из URL
  const navigate = useNavigate();
  const [job, setJob] = useState<JobDetails | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [jobRes, appsRes] = await Promise.all([
        api.get(`/jobs/${id}`),
        api.get(`/applications/job/${id}`) // Нужно будет проверить этот роут на бэке
      ]);
      setJob(jobRes.data);
      setApplications(appsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  // Смена статуса кандидата
  const handleStatusUpdate = async (appId: string, newStatus: string) => {
    try {
      await api.patch(`/applications/${appId}`, { status: newStatus });
      fetchData(); // Обновляем список после изменения
    } catch (err) {
      alert("Error updating status");
    }
  };

  if (isLoading) return <div className="container" style={{padding: '100px', textAlign: 'center'}}>Loading applicants...</div>;
  if (!job) return <div className="container">Job not found.</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
      {/* HEADER: Сделали больше и выразительнее */}
      <div style={{ marginBottom: '50px' }}>
        <Link to="/employer" style={{ color: '#10b981', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
          ← BACK TO DASHBOARD
        </Link>
        <h1 style={{ fontSize: '42px', fontWeight: 900, margin: '15px 0 5px', letterSpacing: '-1px' }}>
          {job?.title}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
           <p style={{ color: '#666', fontSize: '18px', margin: 0 }}>{job?.companyName}</p>
           <span style={{ background: '#111', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', color: '#10b981', border: '1px solid #10b98133' }}>
             {applications.length} Candidates
           </span>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '30px' }}>
        {applications.map(app => (
          <div key={app.id} className="card" style={{ 
            padding: '40px', 
            background: 'linear-gradient(145deg, #0f0f0f, #050505)', 
            border: '1px solid #1a1a1a',
            borderRadius: '24px' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '25px' }}>
                {/* Аватар-заглушка побольше */}
                <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 800, color: '#333', border: '1px solid #222' }}>
                  {app.candidate.firstName?.[0] || 'C'}
                </div>
                
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>
                      {app.candidate.firstName} {app.candidate.lastName}
                    </h2>
                    <span style={{ 
                      fontSize: '10px', 
                      background: app.status === 'invited' ? '#10b981' : '#fbbf24', 
                      color: '#000', padding: '3px 10px', borderRadius: '6px', fontWeight: 900 
                    }}>
                      {app.status.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ color: '#10b981', fontSize: '16px', fontWeight: 500, margin: 0 }}>{app.candidate.email}</p>
                  <p style={{ color: '#444', fontSize: '13px', marginTop: '5px' }}>Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                {/* Кнопка CV */}
                {app.cvUrl && (
                  <a 
                    href={app.cvUrl?.startsWith('http') ? app.cvUrl : `${apiUrl}${app.cvUrl}`}
                    target="_blank" 
                    rel="noreferrer"
                    className="btn pill"
                    style={{ background: '#111', color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    📄 View CV
                  </a>
                )}
                <button className="btn btnPrimary pill" onClick={() => handleStatusUpdate(app.id, 'invited')}>Shortlist</button>
                <button className="btn pill" style={{ color: '#ff4d4d' }} onClick={() => handleStatusUpdate(app.id, 'rejected')}>Decline</button>
              </div>
            </div>

            {/* Motivation Letter Section */}
            <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
              <div style={{ padding: '25px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid #ffffff05' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '12px', color: '#444', textTransform: 'uppercase', letterSpacing: '1px' }}>Motivation Letter</h4>
                <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.7', color: '#aaa', fontStyle: app.coverLetter ? 'normal' : 'italic' }}>
                  {app.coverLetter || "Candidate didn't provide a motivation letter."}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}