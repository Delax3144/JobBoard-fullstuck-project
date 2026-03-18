import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { loadJobs } from "../lib/jobsStorage";
import Modal from "../components/Modal";
import ApplyForm from "../components/ApplyForm";

export default function JobDetails() {
  const params = useParams();
  const id = Number(params.id);
  const jobs = loadJobs();

  const job = jobs.find((j) => j.id === id);

  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);

  if (!job) {
    return (
      <div>
        <h1>Вакансия не найдена</h1>
        <Link to="/jobs">← Назад к списку</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/jobs" style={{ textDecoration: "none", color: "inherit", opacity: 0.8 }}>
        ← Назад
      </Link>

      <h1 style={{ marginTop: 12 }}>{job.title}</h1>

      <p style={{ marginTop: 8, opacity: 0.9 }}>
        <b>{job.company}</b> • {job.location} • {job.level}
      </p>

      <p style={{ marginTop: 8 }}>
        <b>Зарплата:</b> {job.salary}
      </p>

      <div style={{ marginTop: 10 }}>
        <span 
        style={{ 
                padding: 3,
                border: '2px solid rgba(233, 233, 234, 0.08)',
                borderRadius: 8
              }}
          className={`pill ${
            job.status === "active"
              ? "btnPrimary"
              : job.status === "draft"
              ? ""
              : ""
          }`}
        >
          {job.status}
        </span>
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {job.tags.map((tag) => (
          <span
            key={tag}
            style={{
              border: "1px solid #444",
              borderRadius: 999,
              padding: "6px 10px",
              fontSize: 14,
              opacity: 0.9,
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      <p style={{ marginTop: 16, lineHeight: 1.6 }}>{job.description}</p>

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
            <p style={{ marginTop: 0 }}>Отклик сохранён в браузере (localStorage).</p>
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
            jobId={job.id}
            jobTitle={job.title}
            onSuccess={() => setSent(true)}
          />
        )}
      </Modal>
    </div>
  );
}