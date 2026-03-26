import { Router } from "express";
import { prisma } from "../prisma";
import { authMiddleware } from "../middleware/auth";

export const applicationsRouter = Router();

// 1. Отправить отклик (уже был)
applicationsRouter.post("/", authMiddleware, async (req: any, res) => {
  const { jobId, coverLetter } = req.body;
  try {
    const application = await prisma.application.create({
      data: {
        jobId,
        coverLetter,
        candidateId: req.user.id,
        status: "new"
      }
    });
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при отправке отклика" });
  }
});

// 2. Получить мои отклики для кандидата (уже был)
applicationsRouter.get("/my", authMiddleware, async (req: any, res) => {
  const apps = await prisma.application.findMany({
    where: { candidateId: req.user.id },
    include: { 
      job: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1 } // Берем последнее сообщение
    }
  });

  // Добавляем флаг unread для каждого отклика
  const enrichedApps = apps.map(app => {
    const lastMsgTime = app.messages[0]?.createdAt || app.createdAt;
    // Точка горит, если есть новое сообщение ИЛИ статус поменялся позже, чем мы смотрели
    const hasUpdate = lastMsgTime > app.lastViewedByCandidate || app.status !== 'new'; 
    return { ...app, hasUpdate };
  });

  res.json(enrichedApps);
});

// 3. Получить отклики для работодателя (уже был)
applicationsRouter.get("/owner", authMiddleware, async (req: any, res) => {
  try {
    const apps = await prisma.application.findMany({
      where: { job: { ownerId: req.user.id } },
      include: {
        job: true,
        candidate: { select: { id: true, email: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(apps);
  } catch (error) {
    res.status(500).json({ message: "Ошибка загрузки откликов" });
  }
});

// 4. НОВЫЙ: Получить ОДИН отклик по ID (Чтобы ApplicationDetails работал)
applicationsRouter.get("/:id", authMiddleware, async (req: any, res) => {
  const { id } = req.params;
  const isEmployer = req.user.role === 'employer';

  // Обновляем время просмотра при открытии
  const updateData = isEmployer 
    ? { lastViewedByOwner: new Date() } 
    : { lastViewedByCandidate: new Date() };

  const app = await prisma.application.update({
    where: { id },
    data: updateData,
    include: {
      job: true,
      candidate: { select: { id: true, email: true } },
      messages: { orderBy: { createdAt: "asc" } }
    }
  });
  res.json(app);
});

// Обновить статус отклика (только для работодателя)
applicationsRouter.patch("/:id/status", authMiddleware, async (req: any, res) => {
  const { status } = req.body; // Ожидаем 'invited' или 'rejected'
  const { id } = req.params;

  try {
    // Проверяем, что это владелец вакансии меняет статус
    const app = await prisma.application.findUnique({
      where: { id },
      include: { job: true }
    });

    if (!app || app.job.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Нет прав для изменения этого отклика" });
    }

    const updatedApp = await prisma.application.update({
      where: { id },
      data: { status }
    });

    res.json(updatedApp);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при обновлении статуса" });
  }
});

applicationsRouter.post("/", authMiddleware, async (req: any, res) => {
  const { jobId, coverLetter } = req.body;
  try {
    const application = await prisma.application.create({
      data: {
        jobId,
        coverLetter,
        candidateId: req.user.id,
        status: "new"
      }
    });
    res.status(201).json(application);
  } catch (error: any) {
    // Проверка на дубликат отклика (Unique constraint failed)
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "Вы уже отправили отклик на эту вакансию" });
    }
    res.status(500).json({ message: "Ошибка при отправке отклика" });
  }
});

// Отправить сообщение в чат
applicationsRouter.post("/:id/messages", authMiddleware, async (req: any, res) => {
  const { text } = req.body;
  const { id } = req.params;

  try {
    // 1. Находим отклик
    const app = await prisma.application.findUnique({
      where: { id },
      include: { messages: true }
    });

    if (!app) return res.status(404).json({ message: "Отклик не найден" });

    // 2. Логика "Кто может писать":
    // Кандидат может писать только если работодатель уже начал чат (есть хотя бы 1 сообщение)
    // ИЛИ если статус уже не 'new' (например 'invited')
    if (req.user.role === 'candidate' && app.messages.length === 0 && app.status === 'new') {
      return res.status(403).json({ message: "Подождите, пока работодатель напишет первым или изменит статус" });
    }

    // 3. Создаем сообщение
    const message = await prisma.message.create({
      data: {
        applicationId: id,
        senderId: req.user.id,
        text
      }
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Ошибка отправки сообщения" });
  }
});