import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import { authMiddleware } from "../middleware/auth";
import multer from "multer";
import path from "path";
import fs from "fs";

export const authRouter = Router();

// Настройка хранилища для аватарок
const avatarDir = "uploads/avatars/";
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: avatarDir,
  filename: (req: any, file, cb) => {
    cb(null, `avatar-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

function signToken(user: { id: string; role: string }) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");
  return jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: "7d" });
}

authRouter.post("/register", async (req, res) => {
  const { email, password, role, username, firstName, lastName, phone } = req.body;
  if (!email || !password || !role || !username || !firstName || !lastName) {
    return res.status(400).json({ message: "All required fields must be filled" });
  }
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) return res.status(409).json({ message: "email" });
  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) return res.status(409).json({ message: "username" });

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { email, passwordHash, role, username, firstName, lastName, phone },
      select: { id: true, email: true, role: true, username: true, firstName: true, lastName: true, phone: true }
    });
    const token = signToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: "Database error" });
  }
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const token = signToken(user);
  res.json({ 
    user: { id: user.id, email: user.email, role: user.role, username: user.username, firstName: user.firstName, lastName: user.lastName, phone: user.phone, avatarUrl: user.avatarUrl }, 
    token 
  });
});

authRouter.put("/profile", authMiddleware, async (req: any, res) => {
  const { firstName, lastName, phone } = req.body;
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { firstName: firstName as string, lastName: lastName as string, phone: phone as string },
      select: { id: true, email: true, role: true, username: true, firstName: true, lastName: true, phone: true, avatarUrl: true }
    });
    res.json({ user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

authRouter.get("/me", authMiddleware, async (req: any, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, role: true, username: true, firstName: true, lastName: true, phone: true, avatarUrl: true }
  });
  res.json({ user });
});

// Роут загрузки аватара
authRouter.post("/avatar", authMiddleware, upload.single("avatar"), async (req: any, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl },
      select: { id: true, email: true, username: true, firstName: true, lastName: true, avatarUrl: true, role: true }
    });
    
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Upload failed" });
  }
});