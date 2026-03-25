import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import JobCard from "../components/JobCard";
import api from "../lib/api"; // Подключаем API клиент

type LocationFilter = "All" | "Warsaw" | "Remote" | "Krakow";
type LevelFilter = "All" | "Intern" | "Junior" | "Middle";

interface Job {
  id: string;
  title: string;
  companyName: string; // Поле из БД
  location: string;
  level: string;
  salaryFrom: number;
  salaryTo: number;
  tags: string; // В SQLite это строка
  status: string;
}

export default function Jobs() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState<LocationFilter>("All");
  const [level, setLevel] = useState<LevelFilter>("All");
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ЗАГРУЗКА ИЗ БАЗЫ
  useEffect(() => {
    api.get('/jobs')
      .then(res => {
        setJobs(res.data.jobs);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Ошибка загрузки:", err);
        setIsLoading(false);
      });
  }, []);

  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase();

    return jobs.filter((job) => {
      // Показываем только опубликованные
      const isPublished = job.status === "published";
      const matchesLocation = location === "All" ? true : job.location === location;
      const matchesLevel = level === "All" ? true : job.level === level;

      const matchesQuery = !q
        ? true
        : `${job.title} ${job.companyName} ${job.location} ${job.tags}`
            .toLowerCase()
            .includes(q);

      return isPublished && matchesLocation && matchesLevel && matchesQuery;
    });
  }, [jobs, query, location, level]);

  const locations: LocationFilter[] = ["All", "Warsaw", "Remote", "Krakow"];
  const levels: LevelFilter[] = ["All", "Intern", "Junior", "Middle"];

  if (isLoading) return <div className="container">Загрузка вакансий...</div>;

  return (
    <div>
      <h1 className="h1">Jobs</h1>
      <p className="p">Поиск и фильтры как в настоящем продукте.</p>

      <div className="panel">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск: React, Warsaw, FinTech…"
            className="input"
          />

          <select value={location} onChange={(e) => setLocation(e.target.value as LocationFilter)} className="input">
            {locations.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
          </select>

          <select value={level} onChange={(e) => setLevel(e.target.value as LevelFilter)} className="input">
            {levels.map((lvl) => <option key={lvl} value={lvl}>{lvl}</option>)}
          </select>
        </div>
        <div className="small" style={{ marginTop: 12 }}>Найдено: {filteredJobs.length}</div>
      </div>

      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        {filteredJobs.length === 0 ? (
          <div className="panel">Ничего не найдено</div>
        ) : (
          filteredJobs.map((job) => (
            <Link key={job.id} to={`/jobs/${job.id}`} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
              <JobCard
                title={job.title}
                company={job.companyName} // Исправили на companyName
                location={job.location || "Remote"}
                salary={`${job.salaryFrom} - ${job.salaryTo} PLN`}
                // Превращаем строку "React, Node" в массив для карточки
                tags={job.tags ? job.tags.split(',').map(t => t.trim()) : []}
              />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}