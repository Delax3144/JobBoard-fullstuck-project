import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../lib/api"; 
import Modal from "../components/Modal";
import ApplyForm from "../components/ApplyForm";

interface Job {
  id: string;
  title: string;
  companyName: string;
  companyLogo?: string; // Добавили логотип
  location: string;
  level: string;
  salaryFrom: number;
  salaryTo: number;
  tags: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    api.get(`/jobs/${id}`)
      .then(res => setJob(res.data))
      .catch(err => console.error("Ошибка загрузки:", err))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <div className="container" style={{padding: '100px', textAlign: 'center', color: '#fff'}}>Загрузка вакансии...</div>;
  if (!job) return <div className="container" style={{padding: '100px', textAlign: 'center', color: '#fff'}}><h1>Вакансия не найдена</h1><Link to="/jobs" style={{ color: '#10b981' }}>← Назад</Link></div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
      <Link to="/jobs" style={{ textDecoration: "none", color: "#666", fontSize: '14px', fontWeight: 600 }}>
        ← BACK TO SEARCH
      </Link>

      <div className="card" style={{ 
        marginTop: '30px', 
        padding: '50px', 
        background: 'linear-gradient(145deg, #0f0f0f, #050505)', 
        border: '1px solid #1a1a1a',
        borderRadius: '32px'
      }}>
        
        {/* ВЕРХНЯЯ ЧАСТЬ: ЛОГО И ЗАГОЛОВОК */}
        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', marginBottom: '40px' }}>
          <div style={{ 
            width: '100px', height: '100px', minWidth: '100px', borderRadius: '24px', 
            background: '#000', border: '1px solid #222', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', overflow: 'hidden' 
          }}>
            {job.companyLogo ? (
              <img 
                src={job.companyLogo?.startsWith('http') ? job.companyLogo : `${apiUrl}${job.companyLogo}`}
                alt="logo" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              <span style={{ fontSize: '32px', fontWeight: 800, color: '#333' }}>{job.companyName[0]}</span>
            )}
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}>
                {job.status === "published" ? "Active" : job.status}
              </span>
              <span style={{ color: '#444', fontSize: '14px' }}>• Создано: {new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '36px', fontWeight: 900, letterSpacing: '-1px', color: '#fff', lineHeight: 1.1 }}>{job.title}</h1>
            <p style={{ margin: '12px 0 0', fontSize: '18px', color: '#888' }}>
              <b style={{ color: '#fff' }}>{job.companyName}</b> • {job.location || 'Remote'} • {job.level}
            </p>
          </div>
        </div>

        {/* ПАНЕЛЬ С ЗАРПЛАТОЙ */}
        <div style={{ 
          background: '#000', 
          padding: '25px 35px', 
          borderRadius: '20px', 
          border: '1px solid #1a1a1a',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#444', fontWeight: 800, textTransform: 'uppercase', marginBottom: '5px' }}>Ориентировочная зарплата</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981' }}>
              {job.salaryFrom.toLocaleString()} - {job.salaryTo.toLocaleString()} <span style={{fontSize: '14px'}}>PLN / month</span>
            </div>
          </div>
          <button
            className="btn btnPrimary pill"
            style={{ padding: "14px 30px", fontWeight: 800, fontSize: '15px' }}
            onClick={() => { setSent(false); setOpen(true); }}
          >
            Откликнуться на вакансию
          </button>
        </div>

        {/* ТЕГИ */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ fontSize: '12px', color: '#444', fontWeight: 800, textTransform: 'uppercase', marginBottom: '15px' }}>Технологический стек</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {job.tags && job.tags.split(',').map(t => t.trim()).filter(t => t !== "").map((tag) => (
              <span key={tag} style={{
                border: "1px solid #222",
                borderRadius: "12px",
                padding: "8px 16px",
                fontSize: "14px",
                backgroundColor: '#0a0a0a',
                color: '#aaa',
                fontWeight: 600
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* ОПИСАНИЕ */}
        <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '40px' }}>
          <div style={{ fontSize: '12px', color: '#444', fontWeight: 800, textTransform: 'uppercase', marginBottom: '20px' }}>Описание вакансии</div>
          <div 
            style={{ fontSize: '17px', lineHeight: '1.8', color: '#bbb' }}
            dangerouslySetInnerHTML={{ __html: job.description }} 
          />
        </div>

      </div>

      <Modal open={open} title={sent ? "Успешно" : "Подача отклика"} onClose={() => setOpen(false)}>
        {sent ? (
          <div style={{textAlign: 'center', padding: '20px 0'}}>
            <div style={{fontSize: '40px', marginBottom: '20px'}}>✅</div>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Ваш отклик отправлен!</p>
            <p style={{ color: '#666', marginTop: '10px' }}>Работодатель получит уведомление и ваше резюме.</p>
            <button onClick={() => setOpen(false)} className="btn btnPrimary pill" style={{marginTop: '25px', width: '100%'}}>Отлично</button>
          </div>
        ) : (
          <ApplyForm jobId={job.id} jobTitle={job.title} onSuccess={() => setSent(true)} />
        )}
      </Modal>
    </div>
  );
}