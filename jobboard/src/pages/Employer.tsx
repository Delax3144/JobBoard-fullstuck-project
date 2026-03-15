import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createJob, deleteJob, loadJobs } from "../lib/jobsStorage";
import { loadApplications, updateApplicationStatus } from "../lib/applicationsStorage";
import type { ApplicationStatus } from "../types/application";

export default function Employer() {
  const [refreshKey, setRefreshKey] = useState(0);

  const jobs = useMemo(() => loadJobs(), [refreshKey]);
  const employerJobs = jobs.filter((j) => j.createdBy === "employer");

  const applications = useMemo(() => loadApplications(), [refreshKey]);

  // form state
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("My Company");
  const [location, setLocation] = useState<"Warsaw" | "Remote" | "Krakow">("Warsaw");
  const [salary, setSalary] = useState("8 000 – 12 000 PLN");
  const [level, setLevel] = useState<"Intern" | "Junior" | "Middle">("Junior");
  const [tags, setTags] = useState("React, TypeScript");
  const [description, setDescription] = useState("");

  function forceRefresh() {
    setRefreshKey((x) => x + 1);
  }

  function handleCreate() {
    if (!title.trim()) return;

    createJob({
      title: title.trim(),
      company: company.trim() || "My Company",
      location,
      salary,
      level,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      description: description.trim() || "Описание будет добавлено позже.",
      createdBy: "employer",
    });

    setTitle("");
    setDescription("");
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
      <h1 className="h1">Employer</h1>
      <p className="p">Кабинет работодателя: создание вакансий и кандидаты.</p>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Создать вакансию</h3>

        <div className="row" style={{ marginTop: 10 }}>
          <input className="input" placeholder="Название (например Junior React Dev)"
            value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className="input" placeholder="Компания"
            value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>

        <div className="row" style={{ marginTop: 10 }}>
          <select className="input" value={location} onChange={(e) => setLocation(e.target.value as any)}>
            <option value="Warsaw">Warsaw</option>
            <option value="Remote">Remote</option>
            <option value="Krakow">Krakow</option>
          </select>

          <select className="input" value={level} onChange={(e) => setLevel(e.target.value as any)}>
            <option value="Intern">Intern</option>
            <option value="Junior">Junior</option>
            <option value="Middle">Middle</option>
          </select>
        </div>

        <div className="row" style={{ marginTop: 10 }}>
          <input className="input" placeholder="Зарплата" value={salary} onChange={(e) => setSalary(e.target.value)} />
          <input className="input" placeholder="Теги через запятую: React, TS"
            value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>

        <div style={{ marginTop: 10 }}>
          <textarea
            className="input"
            style={{ minHeight: 110, resize: "vertical" }}
            placeholder="Описание вакансии"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <button className="btn btnPrimary" onClick={handleCreate}>
            Создать вакансию
          </button>
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
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 800 }}>{job.title}</div>
                      <div className="small" style={{ marginTop: 6 }}>
                        {job.company} • {job.location} • {job.level} • {job.salary}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <Link to={`/jobs/${job.id}`} style={{ textDecoration: "none" }}>
                        <button className="btn">Открыть</button>
                      </Link>

                      <button
                        className="btn"
                        onClick={() => {
                          deleteJob(job.id);
                          forceRefresh();
                        }}
                      >
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
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
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