import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import JobCard from "../components/JobCard";
import { loadJobs } from "../lib/jobsStorage";

type LocationFilter = "All" | "Warsaw" | "Remote" | "Krakow";
type LevelFilter = "All" | "Intern" | "Junior" | "Middle";

export default function Jobs() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState<LocationFilter>("All");
  const [level, setLevel] = useState<LevelFilter>("All");

  const jobs = useMemo(() => loadJobs(), []);

  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesClosed = job.status !== "closed";
      const matchesLocation = location === "All" ? true : job.location === location;
      const matchesLevel = level === "All" ? true : job.level === level;

      const matchesQuery = !q
        ? true
        : `${job.title} ${job.company} ${job.location} ${job.tags.join(" ")}`
            .toLowerCase()
            .includes(q);

      return matchesClosed && matchesLocation && matchesLevel && matchesQuery;
    });
  }, [jobs, query, location, level]);

  const locations: LocationFilter[] = ["All", "Warsaw", "Remote", "Krakow"];
  const levels: LevelFilter[] = ["All", "Intern", "Junior", "Middle"];

  return (
    <div>
      <h1 className="h1">Jobs</h1>
      <p className="p">Поиск и фильтры как в настоящем продукте.</p>

      <div className="panel">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск: React, Warsaw, FinTech…"
            className="input"
          />

          <select
            value={location}
            onChange={(e) => setLocation(e.target.value as LocationFilter)}
            className="input"
          >
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as LevelFilter)}
            className="input"
          >
            {levels.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>

        <div className="small" style={{ marginTop: 12 }}>
          Найдено: {filteredJobs.length}
        </div>
      </div>

      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        {filteredJobs.length === 0 ? (
          <div className="panel">Ничего не найдено</div>
        ) : (
          filteredJobs.map((job) => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              style={{ display: "block", textDecoration: "none", color: "inherit" }}
            >
              <JobCard
                title={job.title}
                company={job.company}
                location={job.location}
              />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}