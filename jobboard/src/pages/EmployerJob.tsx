import { Link, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { loadJobs } from "../lib/jobsStorage";
import {
  loadApplications,
  updateApplicationStatus,
} from "../lib/applicationsStorage";
import type { ApplicationStatus } from "../types/application";

export default function EmployerJob() {
  const { id } = useParams();
  const jobId = Number(id);

  const [refreshKey, setRefreshKey] = useState(0);

  const jobs = useMemo(() => loadJobs(), [refreshKey]);
  const job = jobs.find((j) => j.id === jobId);

  const applications = useMemo(
    () => loadApplications().filter((a) => a.jobId === jobId),
    [refreshKey, jobId]
  );

  function forceRefresh() {
    setRefreshKey((x) => x + 1);
  }

  function setStatus(appId: string, status: ApplicationStatus) {
    updateApplicationStatus(appId, status);
    forceRefresh();
  }

  function statusBtn(active: boolean) {
    return `btn pill ${active ? "btnPrimary" : ""}`;
  }

  if (!job) {
    return (
      <div>
        <h1>Vacancy not found</h1>
        <Link to="/employer">
          <button className="btn" style={{ marginTop: 12 }}>
            Back to Employer
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ marginBottom: 8 }}>{job.title}</h1>
          <div className="small">
            {job.company} • {job.location} • {job.level} • {job.salary}
          </div>
          <div style={{ marginTop: 10 }}>
            <span
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
        </div>

        <Link to="/employer" style={{ textDecoration: "none" }}>
          <button className="btn">Назад</button>
        </Link>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <h3 style={{ marginTop: 0 }}>Описание вакансии</h3>
        <p style={{ marginBottom: 0, lineHeight: 1.6 }}>{job.description}</p>

        <div style={{ marginTop: 16 }}>
          <div className="small" style={{ marginBottom: 8 }}>
            Навыки / теги
          </div>

          <div className="row">
            {job.tags.map((tag) => (
              <span key={tag} className="pill">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <h3 style={{ margin: 0 }}>Кандидаты ({applications.length})</h3>

        {applications.length === 0 ? (
          <div className="panel" style={{ marginTop: 12 }}>
            Пока нет откликов на эту вакансию.
          </div>
        ) : (
          <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
            {applications.map((a) => (
              <div key={a.id} className="card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>{a.name}</div>
                    <div className="small">{a.email}</div>
                  </div>

                  <div className="small">
                    {new Date(a.createdAt).toLocaleString()}
                  </div>
                </div>

                <p style={{ marginTop: 12, marginBottom: 0 }}>{a.message}</p>

                <div className="row" style={{ marginTop: 12 }}>
                  <button
                    className={statusBtn(a.status === "new")}
                    onClick={() => setStatus(a.id, "new")}
                  >
                    new
                  </button>

                  <button
                    className={statusBtn(a.status === "reviewed")}
                    onClick={() => setStatus(a.id, "reviewed")}
                  >
                    reviewed
                  </button>

                  <button
                    className={statusBtn(a.status === "invited")}
                    onClick={() => setStatus(a.id, "invited")}
                  >
                    invited
                  </button>

                  <button
                    className={statusBtn(a.status === "rejected")}
                    onClick={() => setStatus(a.id, "rejected")}
                  >
                    rejected
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}