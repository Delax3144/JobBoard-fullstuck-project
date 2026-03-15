export type ApplicationStatus = "new" | "reviewed" | "invited" | "rejected";

export type Application = {
  id: string;
  jobId: number;
  jobTitle: string;
  name: string;
  email: string;
  message: string;
  status: ApplicationStatus;
  createdAt: string; // ISO
};