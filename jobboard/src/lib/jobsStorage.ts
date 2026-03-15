import { jobs as seedJobs, type Job } from "../data/jobs";

const KEY = "jobboard_jobs_v1";

function normalizeJobs(jobs: Job[]): Job[] {
  return jobs.map((job) => ({
    ...job,
    status: job.status ?? "active",
  }));
}

function safeParse(raw: string | null): Job[] | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return normalizeJobs(parsed as Job[]);
  } catch {
    return null;
  }
}

export function loadJobs(): Job[] {
  const stored = safeParse(localStorage.getItem(KEY));

  if (stored && stored.length > 0) {
    saveJobs(stored);
    return stored;
  }

  const normalizedSeed = normalizeJobs(seedJobs);
  localStorage.setItem(KEY, JSON.stringify(normalizedSeed));
  return normalizedSeed;
}

export function saveJobs(jobs: Job[]) {
  localStorage.setItem(KEY, JSON.stringify(jobs));
}

export function createJob(data: Omit<Job, "id">): Job {
  const current = loadJobs();
  const nextId = current.reduce((max, j) => Math.max(max, j.id), 0) + 1;

  const job: Job = {
    ...data,
    status: data.status ?? "active",
    id: nextId,
  };

  saveJobs([job, ...current]);
  return job;
}

export function updateJob(updatedJob: Job) {
  const current = loadJobs();

  const next = current.map((job) =>
    job.id === updatedJob.id ? updatedJob : job
  );

  saveJobs(next);
}

export function deleteJob(id: number) {
  const current = loadJobs();
  saveJobs(current.filter((j) => j.id !== id));
}