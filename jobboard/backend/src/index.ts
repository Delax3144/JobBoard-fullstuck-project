import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { authRouter } from "./routes/auth";
import { jobsRouter } from "./routes/jobs";

dotenv.config();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRouter);
app.use("/jobs", jobsRouter);

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});