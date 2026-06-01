import * as multer from "multer";
import * as path from "path";
import * as fs from "fs";
import type { Express } from "express";

const baseImageDir = path.join(process.cwd(), "image");
if (!fs.existsSync(baseImageDir)) {
  fs.mkdirSync(baseImageDir, { recursive: true });
}

const generateRandomNumber = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sanitizeName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
};

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const profileDir = path.join(baseImageDir, "profile");
    if (!fs.existsSync(profileDir)) {
      fs.mkdirSync(profileDir, { recursive: true });
    }
    cb(null, profileDir);
  },
  filename: (req, file, cb) => {
    const randomNum = generateRandomNumber();
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const filename = `${baseName}-${randomNum}${ext}`;
    cb(null, filename);
  },
});

const eventStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const eventDir = path.join(baseImageDir, "event");
    if (!fs.existsSync(eventDir)) {
      fs.mkdirSync(eventDir, { recursive: true });
    }
    cb(null, eventDir);
  },
  filename: (req, file, cb) => {
    const randomNum = generateRandomNumber();
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const filename = `${baseName}-${randomNum}${ext}`;
    cb(null, filename);
  },
});

const imageFileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (JPEG, JPG, PNG, GIF, WEBP) are allowed!"));
  }
};

export const uploadProfileImage = multer({
  storage: profileStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export const uploadEventImages = multer({
  storage: eventStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});
