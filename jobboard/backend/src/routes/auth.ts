import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import { authMiddleware } from "../middleware/auth";
import { uploadAvatar } from "../lib/upload";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const authRouter = Router();

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

// === ВХОД И РЕГИСТРАЦИЯ ЧЕРЕЗ GOOGLE ===
authRouter.post("/google", async (req, res) => {
  const { credential, role } = req.body; // credential - это токен, который пришлет фронтенд

  try {
    // 1. Отправляем токен в Google и проверяем, настоящий ли он
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    // 2. Достаем данные, которые вернул Google
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ message: "Некорректный токен Google" });
    }

    const { email, given_name, family_name, picture } = payload;

    // 3. Ищем пользователя в нашей базе данных по email
    let user = await prisma.user.findUnique({ where: { email } });

    // 4. ЕСЛИ ПОЛЬЗОВАТЕЛЯ НЕТ — РЕГИСТРИРУЕМ НЕЗАМЕТНО ДЛЯ НЕГО
    if (!user) {
      // Генерируем случайный пароль (он ему не нужен, так как вход через Google, но базе он нужен)
      const randomPassword = Math.random().toString(36).slice(-10) + 'A1!';
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      
      // Генерируем уникальный username (например: ivan_4825)
      const baseUsername = email.split('@')[0];
      const username = `${baseUsername}_${Math.floor(Math.random() * 10000)}`;

      user = await prisma.user.create({
        data: { 
          email, 
          passwordHash, 
          role: role || 'candidate', // По умолчанию кандидат, если не выбрали другое
          username, 
          firstName: given_name || 'User', 
          lastName: family_name || '', 
          avatarUrl: picture, // Сразу берем красивую аватарку из Google!
          phone: '' 
        }
      });
    }

    // 5. Генерируем НАШ обычный JWT-токен (чтобы сайт думал, что мы вошли как обычно)
    const token = signToken(user);
    
    // 6. Отдаем фронтенду юзера и токен
    res.json({ 
      user: { 
        id: user.id, email: user.email, role: user.role, 
        username: user.username, firstName: user.firstName, 
        lastName: user.lastName, avatarUrl: user.avatarUrl 
      }, 
      token 
    });

  } catch (err) {
    console.error("Ошибка авторизации Google:", err);
    res.status(500).json({ message: "Ошибка авторизации через Google" });
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

// Роут загрузки аватара
// Роут загрузки аватара
authRouter.post('/avatar', authMiddleware, uploadAvatar.single('avatar'), async (req: any, res: any) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // ВАЖНО: Cloudinary отдает готовую ссылку в req.file.path
    const avatarUrl = req.file.path; 

    const user = await prisma.user.update({
      where: { id: req.user.id }, // Берем ID из токена, это безопасно
      data: { avatarUrl },
      select: { id: true, email: true, role: true, username: true, firstName: true, lastName: true, avatarUrl: true }
    });

    res.json({ user });
  } catch (err) {
    console.error("Avatar upload error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

// Роут для обновления статуса "В сети"
authRouter.post('/ping', authMiddleware, async (req: any, res: any) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { lastActive: new Date() }
    });
    res.status(200).send();
  } catch (err) {
    res.status(500).send();
  }
});