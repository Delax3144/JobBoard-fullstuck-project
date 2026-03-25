import { Router } from "express";
import { prisma } from "../prisma";
import { authMiddleware } from "../middleware/auth";

export const jobsRouter = Router();

// 1. Получение списка вакансий
jobsRouter.get("/", async (req, res) => {
  const { ownerId } = req.query; 
  const jobs = await prisma.job.findMany({
    where: ownerId ? { ownerId: ownerId as string } : { status: "published" },
    orderBy: { createdAt: "desc" }
  });
  res.json({ jobs });
});

// 2. НОВЫЙ РОУТ: Получение одной вакансии по ID (Чтобы JobDetails работал)
jobsRouter.get("/:id", async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id }
    });

    if (!job) {
      return res.status(404).json({ message: "Вакансия не найдена" });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера при получении вакансии" });
  }
});

// 3. Создание вакансии
jobsRouter.post("/", authMiddleware, async (req: any, res) => {
  if (req.user.role !== "employer") return res.status(403).json({ message: "Employers only" });

  const { title, companyName, location, salaryFrom, salaryTo, description, tags, level, status } = req.body;
  
  try {
    const job = await prisma.job.create({
      data: {
        title, 
        companyName, 
        location, 
        description,
        level: level || "Junior", // Добавили уровень
        salaryFrom: Number(salaryFrom) || 0,
        salaryTo: Number(salaryTo) || 0,
        tags: tags || "", 
        ownerId: req.user.id,
        status: status || "published"
      }
    });
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при создании вакансии" });
  }
});

// 4. Удаление вакансии
jobsRouter.delete("/:id", authMiddleware, async (req: any, res) => {
  const job = await prisma.job.findUnique({ where: { id: req.params.id } });
  if (!job || job.ownerId !== req.user.id) return res.status(403).send();

  await prisma.job.delete({ where: { id: req.params.id } });
  res.status(204).send();
});