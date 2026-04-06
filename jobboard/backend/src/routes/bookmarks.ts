import { Router } from "express";
import { prisma } from "../prisma";
import { authMiddleware } from "../middleware/auth";

export const bookmarksRouter = Router();

// 1. Получить все сохраненные вакансии кандидата
bookmarksRouter.get("/", authMiddleware, async (req: any, res) => {
  try {
    const saved = await prisma.savedJob.findMany({
      where: { userId: req.user.id },
      include: { 
        job: true // Подтягиваем все данные о вакансии
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Возвращаем просто массив вакансий для удобства фронтенда
    const formattedJobs = saved.map((s: any) => ({
      ...s.job,
      savedAt: s.createdAt // Можем оставить дату сохранения
    }));

    res.json(formattedJobs);
  } catch (err) {
    res.status(500).json({ message: "Ошибка получения избранного" });
  }
});

// 2. Переключить статус избранного (Поставить / Убрать лайк)
bookmarksRouter.post("/:jobId", authMiddleware, async (req: any, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    // Ищем, есть ли уже такая запись в базе
    const existing = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: { userId, jobId }
      }
    });

    if (existing) {
      // Если уже сохранена — удаляем (убираем сердечко)
      await prisma.savedJob.delete({
        where: { id: existing.id }
      });
      return res.json({ saved: false });
    } else {
      // Если нет — добавляем (ставим сердечко)
      await prisma.savedJob.create({
        data: { userId, jobId }
      });
      return res.json({ saved: true });
    }
  } catch (err) {
    res.status(500).json({ message: "Ошибка при обновлении избранного" });
  }
});