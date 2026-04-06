import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path"; // Добавь этот импорт

import { authRouter } from "./routes/auth";
import { jobsRouter } from "./routes/jobs";
import { applicationsRouter } from "./routes/applications";
import { bookmarksRouter } from "./routes/bookmarks";

dotenv.config();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// === ЭТА СТРОЧКА ВАЖНА ===
// Она делает файлы в папке uploads доступными для браузера
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRouter);
app.use("/jobs", jobsRouter);
app.use("/applications", applicationsRouter);
app.use("/bookmarks", bookmarksRouter);

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});