import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import JobCard from "../components/JobCard";
import { loadJobs } from "../lib/jobsStorage";

type LocationFilter = "All" | "Warsaw" | "Remote" | "Krakow";

export default function Jobs() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState<LocationFilter>("All");
  const jobs = loadJobs();
  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesLocation = location === "All" ? true : job.location === location;
      const matchesQuery = !q
        ? true
        : `${job.title} ${job.company} ${job.location}`.toLowerCase().includes(q);

      return matchesLocation && matchesQuery;
    });
  }, [query, location]);

  const locations: LocationFilter[] = ["All", "Warsaw", "Remote", "Krakow"];

  return (
    <div>
      <h1 className="h1">Jobs</h1>
      <p className="p">Поиск и фильтры как в настоящем продукте.</p>

      <div className="panel">
        <div className="row">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск: React, Warsaw, FinTech…"
            className="input"
          />

          <div className="row">
            {locations.map((loc) => {
              const active = loc === location;
              return (
                <button
                  key={loc}
                  onClick={() => setLocation(loc)}
                  className={`btn pill ${active ? "btnPrimary" : ""}`}
                >
                  {loc}
                </button>
              );
            })}
          </div>
        </div>

        <div className="small" style={{ marginTop: 12 }}>
          Найдено: {filteredJobs.length}
        </div>
      </div>

      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        {filteredJobs.length === 0 ? (
          <div className="panel">Ничего не найдено 😢</div>
        ) : (
          filteredJobs.map((job) => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              style={{ display: "block", textDecoration: "none", color: "inherit" }}
            >
              <JobCard title={job.title} company={job.company} location={job.location} />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}