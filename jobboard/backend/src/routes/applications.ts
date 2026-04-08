import { Router } from "express";
import { prisma } from "../prisma";
import { authMiddleware } from "../middleware/auth";
import { uploadCV } from "../lib/upload";
import nodemailer from "nodemailer";

export const applicationsRouter = Router();

// === НАСТРОЙКА NODEMAILER ===
// В идеале вынести это в .env, но для тестов оставим здесь
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'vasyakr14@gmail.com', // Замени на свою почту
    pass: 'xxxv zewe uobu ynmm' // Вставь пароль приложения без пробелов
  }
});

// 1. ОТПРАВИТЬ ОТКЛИК
applicationsRouter.post("/", authMiddleware, uploadCV.single("cv"), async (req: any, res) => {
  const { jobId, coverLetter } = req.body;
  const cvUrl = req.file ? req.file.path : null;

  try {
    const application = await prisma.application.create({
      data: {
        jobId,
        coverLetter,
        cvUrl, 
        candidateId: req.user.id,
        status: "new"
      }
    });
    res.status(201).json(application);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "Вы уже отправили отклик на эту вакансию" });
    }
    res.status(500).json({ message: "Ошибка при отправке отклика" });
  }
});

// 2. ПОЛУЧИТЬ ОТКЛИКИ ДЛЯ ВАКАНСИИ
applicationsRouter.get("/job/:jobId", authMiddleware, async (req: any, res) => {
  try {
    const { jobId } = req.params;
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    
    if (!job || job.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const apps = await prisma.application.findMany({
      where: { jobId },
      include: { candidate: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 3. ОБНОВИТЬ СТАТУС (И ОТПРАВИТЬ EMAIL)
applicationsRouter.patch("/:id", authMiddleware, async (req: any, res) => {
  const { status } = req.body; // status: 'invited' или 'rejected'
  
  try {
    // Обновляем статус в базе и достаем инфу для письма
    const updated = await prisma.application.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        candidate: true,
        job: true
      }
    });

    // Формируем письмо в зависимости от статуса
    let subject = "";
    let htmlText = "";

    if (status === 'invited') {
      subject = `🎉 Вас пригласили на вакансию: ${updated.job.title}!`;
      htmlText = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #10b981;">Хорошие новости!</h2>
          <p>Здравствуйте!</p>
          <p>Работодатель рассмотрел ваш отклик на вакансию <b>"${updated.job.title}"</b> в компании <b>${updated.job.companyName}</b> и приглашает вас к общению.</p>
          <p>Войдите в личный кабинет на JobBoard, чтобы прочитать сообщение и начать чат.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888;">Это автоматическое письмо, пожалуйста, не отвечайте на него.</p>
        </div>
      `;
    } else if (status === 'rejected') {
      subject = `Ответ по вакансии: ${updated.job.title}`;
      htmlText = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>Статус вашего отклика обновлен</h2>
          <p>Здравствуйте.</p>
          <p>Спасибо за интерес к вакансии <b>"${updated.job.title}"</b> в компании <b>${updated.job.companyName}</b>.</p>
          <p>К сожалению, на данный момент работодатель принял решение продолжить общение с другими кандидатами. Мы желаем вам успехов в дальнейших поисках!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888;">С уважением,<br/>Команда JobBoard</p>
        </div>
      `;
    }

    // Если статус сменился на тот, что требует письма, отправляем!
    if (status === 'invited' || status === 'rejected') {
      try {
        await transporter.sendMail({
          from: '"JobBoard Platform" <ТВОЙ_GMAIL@gmail.com>', // Замени на свою почту
          to: updated.candidate.email, // Отправляем на почту кандидата из базы
          subject: subject,
          html: htmlText
        });
        console.log(`Письмо отправлено кандидату: ${updated.candidate.email}`);
      } catch (mailError) {
        console.error("Ошибка при отправке письма:", mailError);
        // Мы не прерываем выполнение (не кидаем ошибку 500), 
        // чтобы статус всё равно сохранился в базе, даже если почта упала.
      }
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update error" });
  }
});

// 4. ПОЛУЧИТЬ МОИ ОТКЛИКИ ДЛЯ КАНДИДАТА
applicationsRouter.get("/my", authMiddleware, async (req: any, res) => {
  const apps = await prisma.application.findMany({
    where: { candidateId: req.user.id },
    include: { 
      job: { include: { owner: { select: { lastActive: true } } } }, // Достаем онлайн работодателя
      messages: { orderBy: { createdAt: "desc" }, take: 1 } 
    }
  });

  const enrichedApps = apps.map(app => {
    const lastMsgTime = app.messages[0]?.createdAt || app.createdAt;
    const hasUpdate = lastMsgTime > app.lastViewedByCandidate || app.status !== 'new'; 
    return { ...app, hasUpdate };
  });

  res.json(enrichedApps);
});

// 5. ПОЛУЧИТЬ ОТКЛИКИ ДЛЯ РАБОТОДАТЕЛЯ
applicationsRouter.get("/owner", authMiddleware, async (req: any, res) => {
  try {
    const apps = await prisma.application.findMany({
      where: { job: { ownerId: req.user.id } },
      include: {
        job: true,
        candidate: { select: { id: true, email: true, avatarUrl: true, firstName: true, lastName: true, lastActive: true } } 
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(apps);
  } catch (error) {
    res.status(500).json({ message: "Ошибка загрузки откликов" });
  }
});

// 6. ПОЛУЧИТЬ ОДИН ОТКЛИК ПО ID
applicationsRouter.get("/:id", authMiddleware, async (req: any, res) => {
  const { id } = req.params;
  const isEmployer = req.user.role === 'employer';

  const updateData = isEmployer 
    ? { lastViewedByOwner: new Date() } 
    : { lastViewedByCandidate: new Date() };

  const app = await prisma.application.update({
    where: { id },
    data: updateData,
    include: {
      job: { include: { owner: { select: { lastActive: true } } } },
      candidate: { select: { id: true, email: true, avatarUrl: true, firstName: true, lastName: true, lastActive: true } },
      messages: { orderBy: { createdAt: "asc" } }
    }
  });
  res.json(app);
});

// 7. ОТПРАВИТЬ СООБЩЕНИЕ В ЧАТ
applicationsRouter.post("/:id/messages", authMiddleware, async (req: any, res) => {
  const { text } = req.body;
  const { id } = req.params;

  try {
    const app = await prisma.application.findUnique({
      where: { id },
      include: { messages: true }
    });

    if (!app) return res.status(404).json({ message: "Отклик не найден" });

    if (req.user.role === 'candidate' && app.messages.length === 0 && app.status === 'new') {
      return res.status(403).json({ message: "Подождите, пока работодатель напишет первым или изменит статус" });
    }

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