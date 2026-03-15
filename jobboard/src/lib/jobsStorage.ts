import { jobs as seedJobs, type Job } from "../data/jobs";

const KEY = "jobboard_jobs_v1";

function safeParse(raw: string | null): Job[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Job[]) : null;
  } catch {
    return null;
  }
}

export function loadJobs(): Job[] {
  const stored = safeParse(localStorage.getItem(KEY));
  if (stored && stored.length > 0) return stored;

  // первая инициализация
  localStorage.setItem(KEY, JSON.stringify(seedJobs));
  return seedJobs;
}

export function saveJobs(jobs: Job[]) {
  localStorage.setItem(KEY, JSON.stringify(jobs));
}

export function createJob(data: Omit<Job, "id">): Job {
  const current = loadJobs();
  const nextId = current.reduce((max, j) => Math.max(max, j.id), 0) + 1;

  const job: Job = { ...data, id: nextId };
  saveJobs([job, ...current]);
  return job;
}

export function deleteJob(id: number) {
  const current = loadJobs();
  saveJobs(current.filter((j) => j.id !== id));
}