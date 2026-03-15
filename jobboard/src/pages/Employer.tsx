import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
import type { ApplicationStatus } from "../types/application";
import type { Job, JobStatus } from "../data/jobs";

type JobLocation = "Warsaw" | "Remote" | "Krakow";
type JobLevel = "Intern" | "Junior" | "Middle";

const initialFormState = {
  title: "",
  company: "My Company",
  location: "Warsaw" as JobLocation,
  salary: "8 000 – 12 000 PLN",
  level: "Junior" as JobLevel,
  tags: "React, TypeScript",
  description: "",
  status: "active" as JobStatus,
};

export default function Employer() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingJobId, setEditingJobId] = useState<number | null>(null);

  const jobs = useMemo(() => loadJobs(), [refreshKey]);
  const employerJobs = jobs.filter((j) => j.createdBy === "employer");

  const applications = useMemo(() => loadApplications(), [refreshKey]);

    const employerJobIds = employerJobs.map((job) => job.id);

  const employerApplications = applications.filter((app) =>
    employerJobIds.includes(app.jobId)
  );

const dashboardStats = {
  totalJobs: employerJobs.length,
  activeJobs: employerJobs.filter((job) => job.status === "active").length,
  closedJobs: employerJobs.filter((job) => job.status === "closed").length,
  totalCandidates: employerApplications.length,
  newCandidates: employerApplications.filter((a) => a.status === "new").length,
  invitedCandidates: employerApplications.filter((a) => a.status === "invited").length,
  rejectedCandidates: employerApplications.filter((a) => a.status === "rejected").length,
};

  const [title, setTitle] = useState(initialFormState.title);
  const [company, setCompany] = useState(initialFormState.company);
  const [location, setLocation] = useState<JobLocation>(initialFormState.location);
  const [salary, setSalary] = useState(initialFormState.salary);
  const [level, setLevel] = useState<JobLevel>(initialFormState.level);
  const [tags, setTags] = useState(initialFormState.tags);
  const [description, setDescription] = useState(initialFormState.description);
  const [status, setJobStatus] = useState<JobStatus>(initialFormState.status);

  function forceRefresh() {
    setRefreshKey((x) => x + 1);
  }

  function resetForm() {
    setEditingJobId(null);
    setTitle(initialFormState.title);
    setCompany(initialFormState.company);
    setLocation(initialFormState.location);
    setSalary(initialFormState.salary);
    setLevel(initialFormState.level);
    setTags(initialFormState.tags);
    setDescription(initialFormState.description);
    setJobStatus(initialFormState.status);
  }

  function fillForm(job: Job) {
    setEditingJobId(job.id);
    setTitle(job.title);
    setCompany(job.company);
    setLocation(job.location as JobLocation);
    setSalary(job.salary);
    setLevel(job.level as JobLevel);
    setTags(job.tags.join(", "));
    setDescription(job.description);
    setJobStatus(job.status);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleSubmit() {
    if (!title.trim()) return;

    const payload = {
  title: title.trim(),
  company: company.trim() || "My Company",
  location,
  salary,
  level,
  status,
  tags: tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean),
  description: description.trim() || "Описание будет добавлено позже.",
  createdBy: "employer" as const,
};

    if (editingJobId !== null) {
      updateJob({
        id: editingJobId,
        ...payload,
      });
    } else {
      createJob(payload);
    }

    resetForm();
    forceRefresh();
  }

  function handleDelete(jobId: number) {
    if (!window.confirm("Удалить вакансию?")) return;

    if (editingJobId === jobId) {
      resetForm();
    }

    deleteJob(jobId);
    forceRefresh();
  }

  function statusBtn(active: boolean) {
    return `btn pill ${active ? "btnPrimary" : ""}`;
  }

  function setStatus(appId: string, status: ApplicationStatus) {
    updateApplicationStatus(appId, status);
    forceRefresh();
  }

  return (
    <div>
      <h1>Employer</h1>
      <p className="small">
        Кабинет работодателя: создание вакансий и кандидаты.
      </p>
            <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginTop: 18,
        }}
      >
        <div className="card">
          <div className="small">Total jobs</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>
            {dashboardStats.totalJobs}
          </div>
        </div>
        <div className="card">
          <div className="small">Active jobs</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>
            {dashboardStats.activeJobs}
          </div>
        </div>

        <div className="card">
          <div className="small">Closed jobs</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>
            {dashboardStats.closedJobs}
          </div>
        </div>
        <div className="card">
          <div className="small">Total candidates</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>
            {dashboardStats.totalCandidates}
          </div>
        </div>

        <div className="card">
          <div className="small">New</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>
            {dashboardStats.newCandidates}
          </div>
        </div>

        <div className="card">
          <div className="small">Invited</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>
            {dashboardStats.invitedCandidates}
          </div>
        </div>

        <div className="card">
          <div className="small">Rejected</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>
            {dashboardStats.rejectedCandidates}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <h3 style={{ marginTop: 0 }}>
          {editingJobId !== null ? "Редактировать вакансию" : "Создать вакансию"}
        </h3>

        <div
          style={{
            display: "grid",
            gap: 10,
            gridTemplateColumns: "1fr 1fr",
          }}
        >
          <input
            className="input"
            placeholder="Название (например Junior React Dev)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="input"
            placeholder="Компания"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />

          <select
            className="input"
            value={location}
            onChange={(e) => setLocation(e.target.value as JobLocation)}
          >
            <option value="Warsaw">Warsaw</option>
            <option value="Remote">Remote</option>
            <option value="Krakow">Krakow</option>
          </select>

          <select
            className="input"
            value={level}
            onChange={(e) => setLevel(e.target.value as JobLevel)}
          >
            <option value="Intern">Intern</option>
            <option value="Junior">Junior</option>
            <option value="Middle">Middle</option>
          </select>

          <input
            className="input"
            placeholder="Зарплата"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
          />

          <select
          className="input"
          value={status}
          onChange={(e) => setJobStatus(e.target.value as JobStatus)}
        >
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="closed">Closed</option>
        </select>

          <input
            className="input"
            placeholder="Теги через запятую"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <textarea
            className="input"
            placeholder="Описание вакансии"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ gridColumn: "1 / -1", minHeight: 140, resize: "vertical" }}
          />
        </div>

        <div
          style={{
            marginTop: 12,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <button className="btn btnPrimary" onClick={handleSubmit}>
            {editingJobId !== null ? "Сохранить изменения" : "Создать вакансию"}
          </button>

          {editingJobId !== null && (
            <button className="btn" onClick={resetForm}>
              Отмена
            </button>
          )}
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <h3 style={{ margin: 0 }}>Мои вакансии ({employerJobs.length})</h3>

        <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
          {employerJobs.length === 0 ? (
            <div className="panel">Пока нет созданных вакансий.</div>
          ) : (
            employerJobs.map((job) => {
              const jobApps = applications.filter((a) => a.jobId === job.id);

              return (
                <div key={job.id} className="card">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800 }}>{job.title}</div>

                      <div className="small" style={{ marginTop: 6 }}>
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

                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <Link to={`/employer/job/${job.id}`} style={{ textDecoration: "none" }}>
                        <button className="btn">Открыть</button>
                      </Link>

                      <button className="btn" onClick={() => fillForm(job)}>
                        Редактировать
                      </button>

                      <button className="btn" onClick={() => handleDelete(job.id)}>
                        Удалить
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <div className="small">Кандидаты: {jobApps.length}</div>

                    {jobApps.length === 0 ? (
                      <div className="panel" style={{ marginTop: 10 }}>
                        Пока нет откликов на эту вакансию.
                      </div>
                    ) : (
                      <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                        {jobApps.map((a) => (
                          <div key={a.id} className="panel" style={{ marginTop: 0 }}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 12,
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

                            <p style={{ marginTop: 10, marginBottom: 0, opacity: 0.9 }}>
                              {a.message}
                            </p>

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
            })
          )}
        </div>
      </div>
    </div>
  );
}