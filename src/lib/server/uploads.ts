import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const allowedTypes = new Map([
  ["image/jpeg", ".jpg"], ["image/png", ".png"], ["image/webp", ".webp"], ["image/gif", ".gif"],
]);
const maxUploadBytes = 10 * 1024 * 1024;
const maxDocumentUploadBytes = 25 * 1024 * 1024;

export function uploadsDirectory() {
  return process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
}

export function uploadPath(filename: string) {
  if (path.basename(filename) !== filename || !/^[a-f0-9-]+\.(jpg|png|webp|gif|pdf)$/.test(filename)) return null;
  return path.join(uploadsDirectory(), filename);
}

export async function saveImage(file: File) {
  const extension = allowedTypes.get(file.type);
  if (!extension) throw new Error("Upload a JPG, PNG, WebP, or GIF image.");
  if (!file.size) throw new Error("Select an image to upload.");
  if (file.size > maxUploadBytes) throw new Error("Image must be 10 MB or smaller.");

  const content = Buffer.from(await file.arrayBuffer());
  const validSignature =
    (file.type === "image/jpeg" && content.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) ||
    (file.type === "image/png" && content.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) ||
    (file.type === "image/gif" && (content.subarray(0, 6).toString() === "GIF87a" || content.subarray(0, 6).toString() === "GIF89a")) ||
    (file.type === "image/webp" && content.subarray(0, 4).toString() === "RIFF" && content.subarray(8, 12).toString() === "WEBP");
  if (!validSignature) throw new Error("The uploaded file does not match its image type.");

  await fs.mkdir(uploadsDirectory(), { recursive: true });
  const filename = `${crypto.randomUUID()}${extension}`;
  await fs.writeFile(path.join(uploadsDirectory(), filename), content);
  return `/api/media/${filename}`;
}

export async function saveDocument(file: File) {
  if (file.type !== "application/pdf") throw new Error("Upload a PDF document.");
  if (!file.size) throw new Error("Select a document to upload.");
  if (file.size > maxDocumentUploadBytes) throw new Error("Document must be 25 MB or smaller.");
  const content = Buffer.from(await file.arrayBuffer());
  if (content.subarray(0, 5).toString() !== "%PDF-") throw new Error("The uploaded file does not match its document type.");
  await fs.mkdir(uploadsDirectory(), { recursive: true });
  const filename = `${crypto.randomUUID()}.pdf`;
  await fs.writeFile(path.join(uploadsDirectory(), filename), content);
  return `/api/media/${filename}`;
}

// Kept for the existing Portfolio endpoint during the generic media migration.
export const savePortfolioImage = saveImage;
