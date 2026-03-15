import { Router } from "express";
import { prisma } from "../prisma";

export const jobsRouter = Router();

// public: список вакансий (пока без фильтров)
jobsRouter.get("/", async (_req, res) => {
  const jobs = await prisma.job.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      companyName: true,
      location: true,
      salaryFrom: true,
      salaryTo: true,
      tags: true,
      status: true,
      createdAt: true
    }
  });
  res.json({ jobs });
});

// public: детальная вакансия
jobsRouter.get("/:id", async (req, res) => {
  const job = await prisma.job.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      title: true,
      companyName: true,
      location: true,
      salaryFrom: true,
      salaryTo: true,
      tags: true,
      status: true,
      description: true,
      createdAt: true
    }
  });

  if (!job) return res.status(404).json({ message: "Job not found" });
  res.json({ job });
});