import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Jobs() {
  const { user } = useAuth(); // Нужен для проверки роли (кандидат или нет)
  const [jobs, setJobs] = useState<any[]>([]);
  // Стейт для хранения ID сохраненных вакансий (Set для быстрого поиска)
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set()); 
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedExp, setSelectedExp] = useState("");
  const [salaryRanges, setSalaryRanges] = useState<string[]>([]);

  useEffect(() => {
    // Параллельно загружаем вакансии и (если это кандидат) его закладки
    const fetchData = async () => {
      try {
        const jobsRes = await api.get("/jobs");
        const data = Array.isArray(jobsRes.data) ? jobsRes.data : (jobsRes.data.jobs || []);
        setJobs(data);

        // Если пользователь авторизован и он кандидат - грузим его избранное
        if (user && user.role === 'candidate') {
          const bookmarksRes = await api.get("/bookmarks");
          // Создаем Set из ID сохраненных вакансий
          const ids = new Set(bookmarksRes.data.map((job: any) => job.id));
          setSavedJobIds(ids as Set<string>);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Функция переключения закладки
  const toggleBookmark = async (e: React.MouseEvent, jobId: string) => {
    e.preventDefault(); // Останавливаем переход по ссылке <Link>
    e.stopPropagation();

    if (!user) {
      alert("Please log in as a candidate to save jobs.");
      return;
    }
    if (user.role !== 'candidate') {
      alert("Only candidates can save jobs.");
      return;
    }

    try {
      // Отправляем запрос на бэкенд
      const res = await api.post(`/bookmarks/${jobId}`);
      
      // Обновляем локальный стейт (Set) в зависимости от ответа
      setSavedJobIds(prev => {
        const newSet = new Set(prev);
        if (res.data.saved) {
          newSet.add(jobId);
        } else {
          newSet.delete(jobId);
        }
        return newSet;
      });
    } catch (err) {
      console.error("Error toggling bookmark:", err);
    }
  };

  const toggleSalary = (range: string) => {
    setSalaryRanges(prev => 
      prev.includes(range) ? prev.filter(r => r !== range) : [...prev, range]
    );
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      job.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = 
      selectedLocation === "All Locations" || 
      job.location.includes(selectedLocation);

    const matchesExp = 
      !selectedExp || 
      job.title.toLowerCase().includes(selectedExp.toLowerCase()) ||
      (job.tags && job.tags.toString().toLowerCase().includes(selectedExp.toLowerCase()));

    let matchesSalary = true;
    if (salaryRanges.length > 0) {
      matchesSalary = salaryRanges.some(range => {
        const s = job.salaryTo;
        if (range === "5k-10k") return s >= 5000 && s <= 10000;
        if (range === "10k-20k") return s > 10000 && s <= 20000;
        if (range === "20k+") return s > 20000;
        return false;
      });
    }

    return matchesSearch && matchesLocation && matchesExp && matchesSalary;
  });

  return (
    <div style={{ padding: '40px 0', minHeight: '100vh', color: '#fff' }}>
      <div className="container">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '42px', fontWeight: '800', margin: 0, letterSpacing: '-1px' }}>
              Explore <span style={{ color: '#10b981' }}>Careers</span>
            </h1>
            <p style={{ color: '#666', marginTop: '10px' }}>Showing {filteredJobs.length} active opportunities</p>
          </div>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ position: 'relative' }}>
              <input 
                className="input" 
                placeholder="Job title or keywords..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '300px', background: '#111', border: '1px solid #222', paddingLeft: '40px', color: '#fff' }} 
              />
              <span style={{ position: 'absolute', left: '15px', top: '12px', opacity: 0.3 }}>🔍</span>
            </div>
            <button className="btn btnPrimary" style={{ padding: '0 25px' }}>Find Jobs</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '30px' }}>
          <aside>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '25px', position: 'sticky', top: '100px' }}>
              <h4 style={{ marginBottom: '20px' }}>Filters</h4>
              
              <div style={{ marginBottom: '25px' }}>
                <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '10px' }}>Location</label>
                <select className="input" value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} style={{ background: '#000', border: '1px solid #222', color: '#fff' }}>
                  <option>All Locations</option>
                  <option>Remote</option>
                  <option>Warsaw</option>
                </select>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '10px' }}>Salary Range (PLN)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[{id: "5k-10k", label: "5k - 10k"}, {id: "10k-20k", label: "10k - 20k"}, {id: "20k+", label: "20k+"}].map(r => (
                    <label key={r.id} style={{ fontSize: '14px', display: 'flex', gap: '10px', cursor: 'pointer', color: '#888' }}>
                      <input type="checkbox" checked={salaryRanges.includes(r.id)} onChange={() => toggleSalary(r.id)} style={{ accentColor: '#10b981' }} /> {r.label}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '10px' }}>Experience</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {['Junior', 'Middle', 'Senior', 'Lead'].map(lv => (
                    <button key={lv} onClick={() => setSelectedExp(lv === selectedExp ? "" : lv)} style={{ background: selectedExp === lv ? '#10b981' : '#1a1a1a', border: '1px solid #333', color: selectedExp === lv ? '#000' : '#fff', borderRadius: '8px', padding: '5px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                      {lv}
                    </button>
                  ))}
                </div>
              </div>

              <button className="btn" onClick={() => {setSearchTerm(""); setSelectedLocation("All Locations"); setSelectedExp(""); setSalaryRanges([]);}} style={{ width: '100%', border: '1px solid #333', color: '#888', cursor: 'pointer' }}>
                Clear All
              </button>
            </div>
          </aside>

          <main style={{ display: 'grid', gap: '15px', alignItems: 'start' }}>
            {filteredJobs.map((job) => {
              const isSaved = savedJobIds.has(job.id);
              
              return (
                <Link to={`/jobs/${job.id}`} key={job.id} style={{ textDecoration: 'none' }}>
                  <div className="job-card" style={{ display: 'flex', gap: '20px', alignItems: 'center', position: 'relative' }}>
                    
                    <div style={{ 
                      width: '60px', height: '60px', minWidth: '60px', borderRadius: '14px', 
                      background: '#000', border: '1px solid #222', display: 'flex', 
                      alignItems: 'center', justifyContent: 'center', overflow: 'hidden' 
                    }}>
                      {job.companyLogo ? (
                        <img 
                          src={import.meta.env.VITE_API_URL 
                            ? `${import.meta.env.VITE_API_URL}${job.companyLogo}` 
                            : `http://localhost:4000${job.companyLogo}`} 
                          alt="logo" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', padding: '0' }} 
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<span style="font-size: 24px; font-weight: 800; color: #333;">${job.companyName[0]}</span>`;
                            }
                          }}
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
                        <span style={{ marginLeft: 'auto', background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                          Full-time
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        {(() => {
                          let t = job.tags;
                          if (typeof t === 'string') t = t.split(',').map((s:any)=>s.trim());
                          if (!Array.isArray(t)) t = ['React', 'TS'];
                          return t.map((tag: string) => (
                            <span key={tag} className="tech-tag" style={{
                              fontSize: '11px', padding: '3px 10px', borderRadius: '6px',
                              background: 'rgba(16,185,129,0.1)', color: '#10b981',
                              border: '1px solid rgba(16,185,129,0.2)'
                            }}>
                              {tag}
                            </span>
                          ));
                        })()}
                      </div>
                    </div>

                    {/* КНОПКА ЗАКЛАДКИ */}
                    {(!user || user.role === 'candidate') && (
                      <button 
                        onClick={(e) => toggleBookmark(e, job.id)}
                        style={{ 
                          position: 'absolute', top: '15px', left: '70px', // Разместили правее логотипа
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          fontSize: '20px', zIndex: 10,
                          transition: 'transform 0.2s',
                          transform: isSaved ? 'scale(1.1)' : 'scale(1)'
                        }}
                        title={isSaved ? "Remove from Saved" : "Save Job"}
                      >
                        {isSaved ? '❤️' : '🤍'}
                      </button>
                    )}

                  </div>
                </Link>
              );
            })}
            {filteredJobs.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>No jobs found matching your criteria.</div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}