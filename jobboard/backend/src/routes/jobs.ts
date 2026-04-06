import { Router } from "express";
import { prisma } from "../prisma";
import { authMiddleware } from "../middleware/auth";
import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

export const jobsRouter = Router();

const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, "uploads/");
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// 1. Получение всех или по владельцу
jobsRouter.get("/", async (req, res) => {
  const { ownerId } = req.query; 
  const jobs = await prisma.job.findMany({
    where: ownerId ? { ownerId: ownerId as string } : { status: "published" },
    orderBy: { createdAt: "desc" }
  });
  res.json({ jobs });
});

// 2. Получение одной
jobsRouter.get("/:id", async (req, res) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job) return res.status(404).json({ message: "Вакансия не найдена" });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// 3. Создание
jobsRouter.post("/", authMiddleware, upload.single("logo"), async (req: any, res) => {
  if (req.user.role !== "employer") return res.status(403).json({ message: "Employers only" });
  const { title, companyName, location, salaryFrom, salaryTo, description, tags, level, status } = req.body;
  const companyLogo = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const job = await prisma.job.create({
      data: {
        title, companyName, companyLogo, location, description,
        level: level || "Junior",
        salaryFrom: Number(salaryFrom) || 0,
        salaryTo: Number(salaryTo) || 0,
        tags: tags || "", 
        ownerId: req.user.id,
        status: status || "published"
      }
    });
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при создании" });
  }
});

// 4. РЕДАКТИРОВАНИЕ (Исправляет ошибку 404)
jobsRouter.patch("/:id", authMiddleware, upload.single("logo"), async (req: any, res) => {
  const { id } = req.params;
  const { title, companyName, location, salaryFrom, salaryTo, description, tags, level, status } = req.body;

  try {
    const existingJob = await prisma.job.findUnique({ where: { id } });
    if (!existingJob || existingJob.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const companyLogo = req.file ? `/uploads/${req.file.filename}` : undefined;

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        title, companyName, location, level, description, tags, status,
        salaryFrom: salaryFrom ? Number(salaryFrom) : undefined,
        salaryTo: salaryTo ? Number(salaryTo) : undefined,
        ...(companyLogo && { companyLogo })
      }
    });
    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при обновлении" });
  }
});

// 5. Удаление
// Находишь этот роут в самом низу backend/src/routes/jobs.ts и заменяешь:
jobsRouter.delete("/:id", authMiddleware, async (req: any, res) => {
  try {
    const jobId = req.params.id;
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    
    if (!job || job.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // ВАЖНО: Сначала удаляем все отклики, связанные с этой вакансией,
    // чтобы избежать ошибки Foreign Key Constraint (ошибка 500)
    await prisma.application.deleteMany({ where: { jobId: jobId } });

    // Теперь, когда вакансия "свободна", удаляем её
    await prisma.job.delete({ where: { id: jobId } });
    
    res.status(204).send();
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});