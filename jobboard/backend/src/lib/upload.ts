import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// 1. Подключаемся к облаку (данные возьмутся из .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ==========================================
// 2. Настройки для АВАТАРОК
// ==========================================
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (_req, _file) => ({
    folder: 'jobboard/avatars', // Папка в Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  }),
});
export const uploadAvatar = multer({ storage: avatarStorage });

// ==========================================
// 3. Настройки для ВАКАНСИЙ (Логотипы)
// ==========================================
const jobStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (_req, _file) => ({
    folder: 'jobboard/jobs',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  }),
});
export const uploadJob = multer({ storage: jobStorage });

// ==========================================
// 4. Настройки для РЕЗЮМЕ (CV)
// ==========================================
const cvStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (_req, _file) => ({
    folder: 'jobboard/cvs',
    resource_type: 'auto', // ВАЖНО: разрешает загружать не только картинки, но и документы (PDF)
    allowed_formats: ['pdf', 'doc', 'docx'],
  }),
});
export const uploadCV = multer({ 
  storage: cvStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Твой лимит: 5 MB
});