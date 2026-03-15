import type { Application, ApplicationStatus } from "../types/application";

const KEY = "jobboard_applications_v1";

export function loadApplications(): Application[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Application[];
  } catch {
    return [];
  }
}

function saveAll(apps: Application[]) {
  localStorage.setItem(KEY, JSON.stringify(apps));
}

export function saveApplication(app: Omit<Application, "status">) {
  const current = loadApplications();
  const next: Application[] = [{ ...app, status: "new" }, ...current];
  saveAll(next);
}

export function updateApplicationStatus(id: string, status: ApplicationStatus) {
  const current = loadApplications();
  const next = current.map((a) => (a.id === id ? { ...a, status } : a));
  saveAll(next);
}

export function clearApplications() {
  localStorage.removeItem(KEY);
}