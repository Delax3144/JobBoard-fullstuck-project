export type JobStatus = "active" | "draft" | "closed";

export type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  level: "Intern" | "Junior" | "Middle";
  tags: string[];
  description: string;
  createdBy?: "seed" | "employer";
  status: JobStatus;
};
export const jobs: Job[] = [
  {
    id: 1,
    title: "Junior Frontend Developer",
    company: "TechSoft",
    location: "Warsaw",
    salary: "8 000 – 12 000 PLN",
    level: "Junior",
    tags: ["React", "TypeScript", "CSS"],
    description:
      "Работа с UI, компоненты, интеграция с API. Важно: аккуратная верстка и базовое понимание React.",
    createdBy: "seed",
    status: "active",
  },
  {
    id: 2,
    title: "React Developer",
    company: "StartupHub",
    location: "Remote",
    salary: "2 000 – 3 500 EUR",
    level: "Junior",
    tags: ["React", "Hooks", "REST"],
    description:
      "Удалённая команда, задачи по фронту. Будет плюсом опыт с роутингом, формами и состоянием.",
    createdBy: "seed",
    status: "active",
  },
  {
    id: 3,
    title: "Fullstack Developer",
    company: "FinTech Pro",
    location: "Krakow",
    salary: "10 000 – 16 000 PLN",
    level: "Middle",
    tags: ["Node.js", "PostgreSQL", "React"],
    description:
      "Поддержка фич end-to-end: фронт + API + база. Нужна дисциплина и умение разбираться в коде.",
    createdBy: "seed",
    status: "active",
  },
  {
    id: 4,
    title: "Frontend Intern",
    company: "WebStudio",
    location: "Warsaw",
    salary: "3 000 – 5 000 PLN",
    level: "Intern",
    tags: ["HTML", "CSS", "JS"],
    description:
    "Стажировка: верстка, правки UI, простые компоненты. Отлично подойдёт как первая работа.",
    createdBy: "seed",
    status: "active",
  },
  {
    id: 5,
    title: "Junior Fullstack",
    company: "CloudNine",
    location: "Remote",
    salary: "8 500 – 13 500 PLN",
    level: "Junior",
    tags: ["Express", "MongoDB", "React"],
    description:
      "Небольшой продукт, много практики. Важно уметь делать CRUD и понимать авторизацию.",
  createdBy: "seed",
  status: "active",
  },
];