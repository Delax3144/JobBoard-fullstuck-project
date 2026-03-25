import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import { authMiddleware } from "../middleware/auth";

export const authRouter = Router();

function signToken(user: { id: string; role: string }) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");
  return jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: "7d" });
}

authRouter.post("/register", async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) return res.status(400).json({ message: "All fields required" });
  
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ message: "Email already in use" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, role },
    select: { id: true, email: true, role: true }
  });

  const token = signToken(user);
  res.status(201).json({ user, token });
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signToken(user);
  res.json({ user: { id: user.id, email: user.email, role: user.role }, token });
});

// НОВЫЙ РОУТ: Смена роли в профиле
authRouter.patch("/update-profile", authMiddleware, async (req: any, res) => {
  const { role } = req.body;
  if (role !== "employer" && role !== "candidate") return res.status(400).send();

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { role },
    select: { id: true, email: true, role: true }
  });

  // Генерируем новый токен, так как роль внутри токена изменилась!
  const token = signToken(user);
  res.json({ user, token });
});

authRouter.get("/me", authMiddleware, async (req: any, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, role: true }
  });
  res.json({ user });
});