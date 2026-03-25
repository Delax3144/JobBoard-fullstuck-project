import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api"; // Подключаем наш API

// УДАЛИЛИ старые импорты Storage
/*
import {
  createJob,
  deleteJob,
  loadJobs,
  updateJob,
} from "../lib/jobsStorage";
import {
  loadApplications,
  updateApplicationStatus,
} from "../lib/applicationsStorage";
*/

// Подправляем типы под БД (ID — строки, теги — строка)
type JobLocation = "Warsaw" | "Remote" | "Krakow";
type JobLevel = "Intern" | "Junior" | "Middle";
// Используем статусы из Prisma: published, draft, archived
type JobStatus = "published" | "draft" | "archived";

interface Job {
  id: string; // В базе это UUID
  title: string;
  companyName: string;
  location: string;
  salaryFrom: number;
  salaryTo: number;
  level: string;
  tags: string; // SQLite хранит как строку
  description: string;
  status: JobStatus;
  ownerId: string;
  createdAt: string;
}

// Отклики пока заглушены, так как на бэкенде еще нет роута для них
interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  candidate: { email: string; email_verified?: boolean }; 
  coverLetter: string;
  status: "new" | "reviewed" | "invited" | "rejected";
  createdAt: string;
}

const initialFormState = {
  title: "",
  companyName: "",
  location: "Warsaw" as JobLocation,
  salaryFrom: "", // Стейт формы держим строкой
  salaryTo: "",
  level: "Junior" as JobLevel,
  tags: "React, TypeScript",
  description: "",
  status: "published" as JobStatus, // По умолчанию "published"
};

export default function Employer() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  // Applications пока заглушены, так как на бэкенде еще нет роута для них
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [jobFilter, setJobFilter] = useState<"all" | JobStatus>("all");
  const [jobSearch, setJobSearch] = useState("");

  // Функция загрузки данных с бэкенда
  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // 1. Загружаем ваши вакансии
      const jobsRes = await api.get(`/jobs?ownerId=${user.id}`);
      setJobs(jobsRes.data.jobs);

      // 2. Загружаем отклики через НОВЫЙ роут /owner
      const appsRes = await api.get('/applications/owner');
      setApplications(appsRes.data); // Теперь это не пустой массив
    } catch (err) {
      console.error("Error fetching employer data", err);
    } finally {
      setIsLoading(false);
    }

    const handleStatusChange = async (appId: string, newStatus: string) => {
  try {
    await api.patch(`/applications/${appId}/status`, { status: newStatus });
    fetchData(); // Перезагружаем данные, чтобы счетчики обновились
  } catch (err) {
    alert("Не удалось обновить статус");
  }
};
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const filteredEmployerJobs = useMemo(() => {
    return jobs
      .filter((job) => (jobFilter === "all" ? true : job.status === jobFilter))
      .filter((job) => {
        if (!jobSearch.trim()) return true;
        const q = jobSearch.toLowerCase();
        return (
          job.title.toLowerCase().includes(q) ||
          job.companyName.toLowerCase().includes(q) ||
          job.tags.toLowerCase().includes(q)
        );
      });
  }, [jobs, jobFilter, jobSearch]);

  // Сбор статистики (твой оригинальный блок)
  const employerJobIds = useMemo(() => jobs.map((job) => job.id), [jobs]);
  const employerApplications = useMemo(() => applications.filter((app) =>
    employerJobIds.includes(app.jobId)
  ), [applications, employerJobIds]);

  const dashboardStats = useMemo(() => ({
    totalJobs: jobs.length,
    activeJobs: jobs.filter((job) => job.status === "published").length,
    draftJobs: jobs.filter((job) => job.status === "draft").length,
    archivedJobs: jobs.filter((job) => job.status === "archived").length,
    totalCandidates: employerApplications.length,
    newCandidates: employerApplications.filter((a) => a.status === "new").length,
    invitedCandidates: employerApplications.filter((a) => a.status === "invited").length,
    rejectedCandidates: employerApplications.filter((a) => a.status === "rejected").length,
  }), [jobs, employerApplications]);

  // Стейт формы (поменяли company на companyName)
  const [title, setTitle] = useState(initialFormState.title);
  const [companyName, setCompanyName] = useState(initialFormState.companyName);
  const [location, setLocation] = useState<JobLocation>(initialFormState.location);
  const [salaryFrom, setSalaryFrom] = useState(initialFormState.salaryFrom);
  const [salaryTo, setSalaryTo] = useState(initialFormState.salaryTo);
  const [level, setLevel] = useState<JobLevel>(initialFormState.level);
  const [tags, setTags] = useState(initialFormState.tags);
  const [description, setDescription] = useState(initialFormState.description);
  const [status, setJobStatus] = useState<JobStatus>(initialFormState.status);

  function resetForm() {
    setEditingJobId(null);
    setTitle(initialFormState.title);
    setCompanyName(initialFormState.companyName);
    setLocation(initialFormState.location);
    setSalaryFrom(initialFormState.salaryFrom);
    setSalaryTo(initialFormState.salaryTo);
    setLevel(initialFormState.level);
    setTags(initialFormState.tags);
    setDescription(initialFormState.description);
    setJobStatus(initialFormState.status);
  }

  function fillForm(job: Job) {
    setEditingJobId(job.id);
    setTitle(job.title);
    setCompanyName(job.companyName);
    setLocation(job.location as JobLocation);
    setSalaryFrom(String(job.salaryFrom));
    setSalaryTo(String(job.salaryTo));
    setLevel(job.level as JobLevel);
    setTags(job.tags);
    setDescription(job.description);
    setJobStatus(job.status);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // САМОЕ ВАЖНОЕ: Теперь handleSubmit шлет данные на бэкенд
  async function handleSubmit() {
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      companyName: companyName.trim() || "My Company",
      location,
      salaryFrom: Number(salaryFrom) || 0,
      salaryTo: Number(salaryTo) || 0,
      level,
      status, // теперь это published/draft/archived
      tags: tags.trim(), // В SQLite это просто строка
      description: description.trim() || "Описание будет добавлено позже.",
    };

    try {
      if (editingJobId !== null) {
        // PATCH запрос для обновления
        await api.patch(`/jobs/${editingJobId}`, payload);
      } else {
        // POST запрос для создания
        await api.post('/jobs', payload);
      }
      resetForm();
      fetchData(); // Перезагружаем список из базы
    } catch (err) {
      alert("Ошибка при сохранении вакансии");
    }
  }

  async function handleDelete(jobId: string) {
    if (!window.confirm("Удалить вакансию?")) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      if (editingJobId === jobId) resetForm();
      fetchData();
    } catch (err) {
      alert("Ошибка при удалении");
    }
  }

  // Заглушка для смены статуса отклика (нужен роут на бэке)
  async function setApplicationStatus(appId: string, newStatus: any) {
    try {
      // await api.patch(`/applications/${appId}/status`, { status: newStatus });
      // fetchData();
      alert("Смена статуса пока не реализована на бэкенде");
    } catch (err) {
      alert("Ошибка");
    }
  }

  if (isLoading) return <div className="container">Loading employer console...</div>

  return (
    <div className="container">
      {/* 100% Твой оригинальный UI блок-в-блок! */}
      <h1>Employer</h1>
      <p className="small">Кабинет работодателя: создание вакансий и кандидаты.</p>
      
      {/* Блок статистики (твой оригинальный) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 18 }}>
        <div className="card"><div className="small">Total jobs</div><div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{dashboardStats.totalJobs}</div></div>
        <div className="card"><div className="small">Published jobs</div><div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{dashboardStats.activeJobs}</div></div>
        <div className="card"><div className="small">Draft jobs</div><div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{dashboardStats.draftJobs}</div></div>
        <div className="card"><div className="small">Archived jobs</div><div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{dashboardStats.archivedJobs}</div></div>
        <div className="card"><div className="small">Total candidates</div><div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{dashboardStats.totalCandidates}</div></div>
        <div className="card"><div className="small">New</div><div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{dashboardStats.newCandidates}</div></div>
        <div className="card"><div className="small">Invited</div><div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{dashboardStats.invitedCandidates}</div></div>
        <div className="card"><div className="small">Rejected</div><div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{dashboardStats.rejectedCandidates}</div></div>
      </div>

      {/* Форма создания/редактирования (твоя оригинальная) */}
      <div className="card" style={{ marginTop: 18 }}>
        <h3 style={{ marginTop: 0 }}>{editingJobId !== null ? "Редактировать вакансию" : "Создать вакансию"}</h3>
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
          <input className="input" placeholder="Название" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className="input" placeholder="Компания" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          <select className="input" value={location} onChange={(e) => setLocation(e.target.value as JobLocation)}>
            <option value="Warsaw">Warsaw</option><option value="Remote">Remote</option><option value="Krakow">Krakow</option>
          </select>
          <select className="input" value={level} onChange={(e) => setLevel(e.target.value as JobLevel)}>
            <option value="Intern">Intern</option><option value="Junior">Junior</option><option value="Middle">Middle</option>
          </select>
          <input className="input" placeholder="Зарплата ОТ" type="number" value={salaryFrom} onChange={(e) => setSalaryFrom(e.target.value)} />
          <input className="input" placeholder="Зарплата ДО" type="number" value={salaryTo} onChange={(e) => setSalaryTo(e.target.value)} />
          <select className="input" value={status} onChange={(e) => setJobStatus(e.target.value as JobStatus)}>
            <option value="published">Published (Active)</option>
            <option value="draft">Draft (Hidden)</option>
            <option value="archived">Archived (Closed)</option>
          </select>
          <input className="input" placeholder="Теги через запятую" value={tags} onChange={(e) => setTags(e.target.value)} style={{ gridColumn: "1 / -1" }} />
          <textarea className="input" placeholder="Описание вакансии" value={description} onChange={(e) => setDescription(e.target.value)} style={{ gridColumn: "1 / -1", minHeight: 140, resize: "vertical" }} />
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
          <button className="btn btnPrimary" onClick={handleSubmit}>{editingJobId !== null ? "Сохранить изменения" : "Создать вакансию"}</button>
          {editingJobId !== null && <button className="btn" onClick={resetForm}>Отмена</button>}
        </div>
      </div>

      {/* Список вакансий (твой оригинальный) */}
      <div style={{ marginTop: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h3 style={{ margin: 0 }}>Мои вакансии ({filteredEmployerJobs.length})</h3>
          <input className="input" placeholder="Search jobs..." value={jobSearch} onChange={(e) => setJobSearch(e.target.value)} style={{ maxWidth: 260 }} />
          <div className="row" style={{ gap: 8 }}>
            {(["all", "published", "draft", "archived"] as const).map(f => (
              <button key={f} className={`btn pill ${jobFilter === f ? "btnPrimary" : ""}`} onClick={() => setJobFilter(f)}>{f}</button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
          {filteredEmployerJobs.length === 0 ? (
            <div className="panel">Пока нет созданных вакансий.</div>
          ) : (
            filteredEmployerJobs.map((job) => {
              // Кандидаты пока заглушены, так как на бэкенде еще нет роута
              const jobApps = applications.filter((a) => a.jobId === job.id);
              return (
                <div key={job.id} className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 800 }}>{job.title}</div>
                      <div className="small" style={{ marginTop: 6 }}>{job.companyName} • {job.location} • {job.level} • {job.salaryFrom} – {job.salaryTo} PLN</div>
                      <div style={{ marginTop: 10 }}>
                        <span className={`pill ${job.status === "published" ? "btnPrimary" : "panel"}`} style={{ padding: '4px 8px', textTransform: 'uppercase', fontSize: 10 }}>
                          {job.status}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <Link to={`/jobs/${job.id}`} style={{ textDecoration: "none" }}><button className="btn">Открыть</button></Link>
                      <button className="btn" onClick={() => fillForm(job)}>Редактировать</button>
                      <button className="btn" onClick={() => handleDelete(job.id)}>Удалить</button>
                    </div>
                  </div>

                  {/* Блок кандидатов (твой оригинальный, пока пустой) */}
                  {/* Внутри цикла filteredEmployerJobs.map((job) => ... */}
                  <div style={{ marginTop: 14, borderTop: '1px solid #2a2a2a', paddingTop: 14 }}>
                    <div className="small" style={{ marginBottom: 10, fontWeight: 'bold' }}>
                      Кандидаты ({jobApps.length}):
                    </div>
                    
                    <div style={{ display: 'grid', gap: 8 }}>
                      {jobApps.map((app) => (
                        <div key={app.id} className="panel" style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Link to={`/applications/${app.id}`} style={{ color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>
                              {app.candidate?.email}
                            </Link>
                            <span style={{ opacity: 0.5, fontSize: 11 }}>{new Date(app.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p style={{ margin: 0, opacity: 0.8, whiteSpace: 'pre-wrap' }}>{app.coverLetter}</p>
                        </div>
                      ))}
                      {jobApps.length === 0 && (
                        <div className="small" style={{ opacity: 0.5 }}>Пока нет новых откликов</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}