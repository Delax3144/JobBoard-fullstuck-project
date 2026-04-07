import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

// 1. ИМПОРТИРУЕМ РЕДАКТОР И ЕГО СТИЛИ
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

type JobLocation = "Warsaw" | "Remote" | "Krakow";
type JobLevel = "Intern" | "Junior" | "Middle" | "Senior" | "Lead";
type JobStatus = "published" | "draft" | "archived";

interface Job {
  id: string; title: string; companyName: string; companyLogo?: string;
  location: string; salaryFrom: number; salaryTo: number;
  level: string; tags: string; description: string;
  status: JobStatus; ownerId: string; createdAt: string;
}

interface Application {
  id: string; jobId: string;
  candidate: { id: string; email: string };
  status: "new" | "reviewed" | "invited" | "rejected";
}

export default function Employer() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  // Стейт формы
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState<JobLocation>("Warsaw");
  const [salaryFrom, setSalaryFrom] = useState("");
  const [salaryTo, setSalaryTo] = useState("");
  const [level, setLevel] = useState<JobLevel>("Junior");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [status, setJobStatus] = useState<JobStatus>("published");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [jobsRes, appsRes] = await Promise.all([
        api.get(`/jobs?ownerId=${user.id}`),
        api.get('/applications/owner') 
      ]);
      setJobs(jobsRes.data.jobs);
      setApplications(appsRes.data);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, [user]);

  const dashboardStats = useMemo(() => ({
    active: jobs.filter(j => j.status === "published").length,
    newApps: applications.filter(a => a.status === "new").length
  }), [jobs, applications]);

  async function handleSubmit() {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('companyName', companyName);
    formData.append('location', location);
    formData.append('level', level);
    formData.append('salaryFrom', salaryFrom);
    formData.append('salaryTo', salaryTo);
    formData.append('tags', tags);
    
    // Отправляем HTML-описание
    formData.append('description', description); 
    
    formData.append('status', status);
    if (logoFile) formData.append('logo', logoFile);

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editingJobId) await api.patch(`/jobs/${editingJobId}`, formData, config);
      else await api.post('/jobs', formData, config);
      resetForm();
      fetchData();
    } catch (err) { alert("Error saving job"); }
  }

  async function handleDelete(id: string) {
    if (window.confirm("Вы уверены, что хотите удалить эту вакансию навсегда?")) {
      try {
        await api.delete(`/jobs/${id}`);
        fetchData();
      } catch (err) { alert("Ошибка при удалении"); }
    }
  }

  function resetForm() {
    setEditingJobId(null);
    setTitle(""); setCompanyName(""); setSalaryFrom(""); setSalaryTo(""); 
    setDescription(""); setTags(""); setLogoFile(null);
    const fileInput = document.getElementById('logoInput') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  }

  function fillForm(job: Job) {
    setEditingJobId(job.id);
    setTitle(job.title); setCompanyName(job.companyName); setLocation(job.location as JobLocation);
    setSalaryFrom(String(job.salaryFrom)); setSalaryTo(String(job.salaryTo));
    setLevel(job.level as JobLevel); setTags(job.tags); setDescription(job.description);
    setJobStatus(job.status);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (isLoading) return <div style={{ color: '#fff', padding: '100px', textAlign: 'center' }}>Loading Admin Console...</div>;

  return (
    <div style={{ padding: '40px 0' }}>
      
      {/* 2. СТИЛИ ДЛЯ ТЕМНОЙ ТЕМЫ QUILL */}
      {/* 2. СТИЛИ ДЛЯ ТЕМНОЙ ТЕМЫ QUILL (С ФИКСОМ ПЕРЕНОСОВ) */}
      <style>{`
        .quill-dark { max-width: 100%; overflow: hidden; }
        .quill-dark .ql-toolbar { background: #111; border: none; border-bottom: 1px solid #222; border-radius: 12px 12px 0 0; display: flex; flex-wrap: wrap; }
        .quill-dark .ql-container { border: none; font-family: inherit; font-size: 15px; color: #fff; }
        
        /* Фикс для бесконечных слов без пробелов */
        .quill-dark .ql-editor { 
          min-height: 150px; 
          padding: 15px; 
          overflow-wrap: break-word; 
          word-wrap: break-word; 
          word-break: break-word; 
        }
        
        .quill-dark .ql-editor.ql-blank::before { color: #666; font-style: normal; }
        .quill-dark .ql-stroke { stroke: #aaa; }
        .quill-dark .ql-fill { fill: #aaa; }
        .quill-dark .ql-picker { color: #aaa; }
        .quill-dark .ql-picker-options { background: #111; border: 1px solid #222; color: #fff; }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 900 }}>Dashboard</h1>
          <p style={{ color: '#666', marginTop: '5px' }}>Welcome back, {user?.email}</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: '#444', fontWeight: 700 }}>ACTIVE ADS</div>
            <div style={{ fontSize: '24px', fontWeight: 800 }}>{dashboardStats.active}</div>
          </div>
          <div style={{ width: '1px', background: '#1a1a1a' }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: '#444', fontWeight: 700 }}>NEW APPS</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981' }}>{dashboardStats.newApps}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '30px', alignItems: 'start' }}>
        
        {/* ЛЕВАЯ ЧАСТЬ (СПИСОК ВАКАНСИЙ) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '5px' }}>Your Vacancies</h2>
          {jobs.map(job => {
            const jobApps = applications.filter(a => a.jobId === job.id);
            return (
              <div key={job.id} className="card" style={{ padding: '25px', background: '#111', border: '1px solid #1a1a1a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ width: '50px', height: '50px', minWidth: '50px', borderRadius: '12px', background: '#000', border: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {job.companyLogo ? (
                            <img src={`${apiUrl}${job.companyLogo}`} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <span style={{ fontSize: '20px', fontWeight: 800, color: '#333' }}>{job.companyName[0]}</span>
                        )}
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', background: '#10b981', color: '#000', padding: '2px 8px', borderRadius: '4px', fontWeight: 900, textTransform: 'uppercase' }}>{job.status}</span>
                      <h3 style={{ margin: '5px 0 5px', fontSize: '18px' }}>{job.title}</h3>
                      <div style={{ fontSize: '13px', color: '#666' }}>{job.companyName} • {job.location} • <span style={{ color: '#fff' }}>{job.salaryFrom} - {job.salaryTo} PLN</span></div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <button className="btn pill" onClick={() => fillForm(job)} style={{ padding: '8px 20px', fontSize: '12px' }}>Edit</button>
                    <button className="btn pill" onClick={() => handleDelete(job.id)} style={{ padding: '8px 20px', fontSize: '12px', color: '#ff4d4d' }}>Delete</button>
                    <Link to={`/employer/job/${job.id}`} className="btn btnPrimary pill" style={{ padding: '8px 20px', fontSize: '12px', textDecoration: 'none' }}>Manage</Link>
                  </div>
                </div>

                <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#444', marginBottom: '10px', textTransform: 'uppercase' }}>Recent Applicants ({jobApps.length})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {jobApps.slice(0, 3).map(app => (
                      <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <Link to={`/employer/candidate/${app.candidate.id}`} style={{ color: '#888', textDecoration: 'none' }}>
                            {app.candidate.email}
                        </Link>
                        <span style={{ color: app.status === 'new' ? '#fbbf24' : '#10b981', fontWeight: 600 }}>{app.status}</span>
                      </div>
                    ))}
                    {jobApps.length === 0 && <div style={{ fontSize: '12px', color: '#333' }}>No applicants yet</div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ПРАВАЯ ЧАСТЬ (ФОРМА) */}
        <div style={{ position: 'sticky', top: '100px' }}>
          <div className="card" style={{ padding: '30px', border: '1px solid #10b98133', background: 'radial-gradient(at top right, #10b98105, transparent)' }}>
            <h2 style={{ marginTop: 0, fontSize: '20px' }}>{editingJobId ? "Edit Posting" : "Create New Offer"}</h2>
            <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
              
              <div style={{ background: '#000', padding: '15px', borderRadius: '12px', border: '1px solid #1a1a1a' }}>
                <label style={{ fontSize: '11px', color: '#444', fontWeight: 700, marginBottom: '8px', display: 'block' }}>COMPANY LOGO</label>
                <input id="logoInput" type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] || null)} style={{ fontSize: '12px', color: '#666' }} />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#444', fontWeight: 700, marginBottom: '5px', display: 'block' }}>JOB TITLE</label>
                <input className="input" style={{ background: '#000' }} placeholder="e.g. Senior Frontend Developer" value={title} onChange={e => setTitle(e.target.value)} />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#444', fontWeight: 700, marginBottom: '5px', display: 'block' }}>COMPANY NAME</label>
                <input className="input" style={{ background: '#000' }} placeholder="Your Company" value={companyName} onChange={e => setCompanyName(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#444', fontWeight: 700, marginBottom: '5px', display: 'block' }}>LOCATION</label>
                  <select className="input" style={{ background: '#000' }} value={location} onChange={e => setLocation(e.target.value as any)}>
                    <option value="Warsaw">Warsaw</option><option value="Remote">Remote</option><option value="Krakow">Krakow</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#444', fontWeight: 700, marginBottom: '5px', display: 'block' }}>LEVEL</label>
                  <select className="input" style={{ background: '#000' }} value={level} onChange={e => setLevel(e.target.value as any)}>
                    <option value="Intern">Intern</option><option value="Junior">Junior</option><option value="Middle">Middle</option><option value="Senior">Senior</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#444', fontWeight: 700, marginBottom: '5px', display: 'block' }}>SALARY FROM (PLN)</label>
                  <input className="input" style={{ background: '#000' }} type="number" value={salaryFrom} onChange={e => setSalaryFrom(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#444', fontWeight: 700, marginBottom: '5px', display: 'block' }}>SALARY TO (PLN)</label>
                  <input className="input" style={{ background: '#000' }} type="number" value={salaryTo} onChange={e => setSalaryTo(e.target.value)} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#444', fontWeight: 700, marginBottom: '5px', display: 'block' }}>TECH STACK</label>
                <input className="input" style={{ background: '#000' }} placeholder="React, Node, TypeScript..." value={tags} onChange={e => setTags(e.target.value)} />
              </div>

              {/* 3. НАШ НОВЫЙ РЕДАКТОР */}
              <div>
                <label style={{ fontSize: '11px', color: '#444', fontWeight: 700, marginBottom: '5px', display: 'block' }}>DESCRIPTION</label>
                <div className="quill-dark" style={{ background: '#000', borderRadius: '12px', border: '1px solid #1a1a1a' }}>
                  <ReactQuill 
                    theme="snow" 
                    value={description} 
                    onChange={setDescription} 
                    placeholder="Explain the role, requirements, and benefits..."
                  />
                </div>
              </div>

              <button className="btn btnPrimary" onClick={handleSubmit} style={{ padding: '15px', borderRadius: '12px', fontWeight: 800, marginTop: '10px' }}>
                {editingJobId ? "UPDATE OFFER" : "POST OFFER NOW"}
              </button>
              {editingJobId && <button className="btn" onClick={resetForm} style={{ border: 'none', color: '#666' }}>Cancel</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}