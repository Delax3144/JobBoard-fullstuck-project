import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
// Удаляем старый storage
// import { loadJobs } from "../lib/jobsStorage";
import api from "../lib/api"; // Подключаем API клиент
import Modal from "../components/Modal";
import ApplyForm from "../components/ApplyForm";

// Определяем интерфейс для вакансии из БД
interface Job {
  id: string;
  title: string;
  companyName: string; // В базе это companyName
  location: string;
  level: string;
  salaryFrom: number;
  salaryTo: number;
  tags: string; // SQLite хранит как строку
  description: string;
  status: string;
  createdAt: string;
}

export default function JobDetails() {
  const params = useParams();
  const id = params.id; // ID теперь строка (UUID)
  
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);

  // ЗАГРУЗКА ИЗ БАЗЫ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    api.get(`/jobs/${id}`)
      .then(res => {
        // Бэкенд возвращает вакансию
        setJob(res.data);
      })
      .catch(err => {
        console.error("Ошибка загрузки вакансии:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) {
    return <div className="container">Загрузка деталей вакансии...</div>;
  }

  if (!job) {
    return (
      <div className="container">
        <h1>Вакансия не найдена</h1>
        <Link to="/jobs" style={{ color: '#10b981' }}>← Назад к списку</Link>
      </div>
    );
  }

  return (
    <div className="container">
      {/* 100% Твой стиль и вёрстка! */}
      <Link to="/jobs" style={{ textDecoration: "none", color: "inherit", opacity: 0.8 }}>
        ← Назад
      </Link>

      <h1 style={{ marginTop: 12 }}>{job.title}</h1>

      <p style={{ marginTop: 8, opacity: 0.9 }}>
        {/* Поменяли company на companyName */}
        <b>{job.companyName}</b> • {job.location || 'Remote'} • {job.level}
      </p>

      <p style={{ marginTop: 8 }}>
        <b>Зарплата:</b> {job.salaryFrom.toLocaleString()} - {job.salaryTo.toLocaleString()} PLN
      </p>

      <div style={{ marginTop: 10 }}>
        <span 
          style={{ 
            padding: '4px 8px',
            border: '2px solid rgba(233, 233, 234, 0.08)',
            borderRadius: 8,
            textTransform: 'uppercase',
            fontSize: 10,
            fontWeight: 'bold'
          }}
          // Проверяем статус "published", а не "active"
          className={job.status === "published" ? "btnPrimary" : "panel"}
        >
          {job.status === "published" ? "Active" : job.status}
        </span>
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {/* Превращаем строку тегов "React, Node" в массив для отображения */}
        {job.tags && job.tags.split(',').map(t => t.trim()).filter(t => t !== "").map((tag) => (
          <span
            key={tag}
            style={{
              border: "1px solid #444",
              borderRadius: 999,
              padding: "6px 10px",
              fontSize: 14,
              opacity: 0.9,
              backgroundColor: '#1e293b'
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Сохранили твой lineHeight */}
      <p style={{ marginTop: 16, lineHeight: 1.6, color: '#ccc' }}>{job.description}</p>

      {/* Твоя кнопка "Откликнуться" */}
      <button
        style={{
          marginTop: 16,
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #444",
          background: "#2b2b2b",
          color: "inherit",
          cursor: "pointer",
        }}
        onClick={() => {
          setSent(false);
          setOpen(true);
        }}
      >
        Откликнуться
      </button>

      <Modal
        open={open}
        title={sent ? "Готово" : "Отклик на вакансию"}
        onClose={() => setOpen(false)}
      >
        {sent ? (
          <div>
            <p style={{ marginTop: 0 }}>Отклик успешно отправлен и сохранён в базе данных!</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setOpen(false)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #444",
                  background: "transparent",
                  color: "inherit",
                  cursor: "pointer",
                }}
              >
                Закрыть
              </button>
              <Link to="/applications" style={{ textDecoration: "none" }}>
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #444",
                    background: "#2b2b2b",
                    color: "inherit",
                    cursor: "pointer",
                  }}
                >
                  Посмотреть отклики
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <ApplyForm
            // ID вакансии теперь строка
            jobId={job.id}
            jobTitle={job.title}
            onSuccess={() => setSent(true)}
          />
        )}
      </Modal>
    </div>
  );
}