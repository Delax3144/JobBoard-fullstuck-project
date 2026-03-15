import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import { authMiddleware } from "../middleware/auth";

export const authRouter = Router();

function signToken(user: { id: string; role: "employer" | "candidate" }) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");
  return jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: "7d" });
}

authRouter.post("/register", async (req, res) => {
  const { email, password, role } = req.body as {
    email?: string;
    password?: string;
    role?: "employer" | "candidate";
  };

  if (!email || !password || !role) {
    return res.status(400).json({ message: "email, password, role are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "password must be at least 6 chars" });
  }
  if (role !== "employer" && role !== "candidate") {
    return res.status(400).json({ message: "role must be employer or candidate" });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ message: "Email already in use" });

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, passwordHash, role },
    select: { id: true, email: true, role: true, createdAt: true }
  });

  const token = signToken({ id: user.id, role: user.role });

  return res.status(201).json({ user, token });
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken({ id: user.id, role: user.role });

  return res.json({
    user: { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt },
    token
  });
});

authRouter.get("/me", authMiddleware, async (req, res) => {
  const userId = req.user!.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true, createdAt: true }
  });
  return res.json({ user });
});