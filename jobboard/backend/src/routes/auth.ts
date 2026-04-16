import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import { authMiddleware } from "../middleware/auth";
import { uploadAvatar } from "../lib/upload";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import nodemailer from "nodemailer";
import crypto from "crypto";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const authRouter = Router();

// Настройка почтальона
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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
  const verificationToken = crypto.randomBytes(32).toString('hex'); // Генерируем токен

  try {
    const user = await prisma.user.create({
      data: { email, passwordHash, role, username, firstName, lastName, phone, verificationToken },
      select: { id: true, email: true, role: true, username: true, firstName: true, lastName: true, phone: true }
    });

    // Отправляем письмо
    const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await transporter.sendMail({
      from: `"JobBoard Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Confirm your email on JobBoard",
      html: `
        <div style="font-family: Arial; padding: 20px; background: #0a0a0a; color: #fff; border-radius: 10px;">
          <h2 style="color: #10b981;">Welcome to JobBoard!</h2>
          <p>Hi ${firstName},</p>
          <p>Please click the button below to verify your email address and activate your account.</p>
          <a href="${verifyLink}" style="display: inline-block; padding: 12px 24px; background: #10b981; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 15px;">Verify Email</a>
        </div>
      `
    });

    // Токен авторизации НЕ отдаем, пока не подтвердит почту
    res.status(201).json({ message: "Успешная регистрация. Проверьте почту!" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Database or email error" });
  }
});

// Новый роут для подтверждения почты
authRouter.post('/verify-email', async (req, res) => {
  const { token } = req.body;
  try {
    const user = await prisma.user.findFirst({ where: { verificationToken: token } });
    if (!user) return res.status(400).json({ message: "Неверный или устаревший токен" });

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verificationToken: null } // Активируем!
    });

    res.json({ message: "Почта успешно подтверждена" });
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Блокируем вход, если почта не подтверждена
  if (!user.isVerified) {
    return res.status(403).json({ message: "Please verify your email first. Check your inbox!" });
  }

  const token = signToken(user);
  res.json({ 
    user: { id: user.id, email: user.email, role: user.role, username: user.username, firstName: user.firstName, lastName: user.lastName, phone: user.phone, avatarUrl: user.avatarUrl }, 
    token 
  });
});

// === ВХОД И РЕГИСТРАЦИЯ ЧЕРЕЗ GOOGLE ===
authRouter.post("/google", async (req, res) => {
  const { credential, role } = req.body;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) return res.status(400).json({ message: "Некорректный токен Google" });

    const { email, given_name, family_name, picture } = payload;
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-10) + 'A1!';
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      const baseUsername = email.split('@')[0];
      const username = `${baseUsername}_${Math.floor(Math.random() * 10000)}`;

      user = await prisma.user.create({
        data: { 
          email, passwordHash, role: role || 'candidate', username, 
          firstName: given_name || 'User', lastName: family_name || '', 
          avatarUrl: picture, phone: '', 
          isVerified: true // <-- Гугл уже проверил почту
        }
      });
    }

    const token = signToken(user);
    res.json({ user: { id: user.id, email: user.email, role: user.role, username: user.username, firstName: user.firstName, lastName: user.lastName, avatarUrl: user.avatarUrl }, token });
  } catch (err) {
    res.status(500).json({ message: "Ошибка авторизации через Google" });
  }
});

// === ВХОД И РЕГИСТРАЦИЯ ЧЕРЕЗ GITHUB ===
authRouter.post("/github", async (req, res) => {
  const { code, role } = req.body;
  try {
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, code,
    }, { headers: { Accept: 'application/json' } });

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) return res.status(400).json({ message: "Неверный код GitHub" });

    const userResponse = await axios.get('https://api.github.com/user', { headers: { Authorization: `Bearer ${accessToken}` } });
    const githubUser = userResponse.data;

    const emailResponse = await axios.get('https://api.github.com/user/emails', { headers: { Authorization: `Bearer ${accessToken}` } });
    const primaryEmailObj = emailResponse.data.find((e: any) => e.primary) || emailResponse.data[0];
    const email = primaryEmailObj?.email;

    if (!email) return res.status(400).json({ message: "Не удалось получить email из GitHub" });

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-10) + 'A1!';
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      const baseUsername = githubUser.login || email.split('@')[0];
      const username = `${baseUsername}_${Math.floor(Math.random() * 1000)}`;

      user = await prisma.user.create({
        data: { 
          email, passwordHash, role: role || 'candidate', username, 
          firstName: githubUser.name?.split(' ')[0] || githubUser.login, lastName: githubUser.name?.split(' ').slice(1).join(' ') || '', 
          avatarUrl: githubUser.avatar_url, phone: '',
          isVerified: true // <-- Гитхаб уже проверил почту
        }
      });
    }

    const token = signToken(user);
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ message: "Ошибка авторизации через GitHub" });
  }
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

authRouter.post('/avatar', authMiddleware, uploadAvatar.single('avatar'), async (req: any, res: any) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const avatarUrl = req.file.path; 
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl },
      select: { id: true, email: true, role: true, username: true, firstName: true, lastName: true, avatarUrl: true }
    });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Upload failed" });
  }
});

authRouter.post('/ping', authMiddleware, async (req: any, res: any) => {
  try {
    await prisma.user.update({ where: { id: req.user.id }, data: { lastActive: new Date() } });
    res.status(200).send();
  } catch (err) { res.status(500).send(); }
});