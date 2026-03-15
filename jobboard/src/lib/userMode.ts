const KEY = "jobboard_user_mode_v1";

export type UserMode = "candidate" | "employer";

export function loadUserMode(): UserMode {
  const raw = localStorage.getItem(KEY);
  return raw === "employer" ? "employer" : "candidate";
}

export function saveUserMode(mode: UserMode) {
  localStorage.setItem(KEY, mode);
}