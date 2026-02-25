import type { Express } from "express";
import { uploadToS3, deleteFromS3, extractKeyFromUrl } from "./s3";
import { v4 as uuidv4 } from "uuid";
import { storage } from "./storage";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (validTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export function registerS3Routes(app: Express): void {
  app.post("/api/uploads/images", upload.array("images", 10), async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files provided" });
      }

      const urls: string[] = [];
      for (const file of files) {
        const extension = file.originalname.split(".").pop()?.toLowerCase() || "jpg";
        const key = `products/${uuidv4()}.${extension}`;
        const url = await uploadToS3(key, file.buffer, file.mimetype);
        urls.push(url);
      }

      res.json({ urls });
    } catch (error) {
      console.error("Error uploading images:", error);
      res.status(500).json({ error: "Failed to upload images" });
    }
  });

  app.post("/api/uploads/delete", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "Image URL required" });
      }

      const key = extractKeyFromUrl(url);
      if (key) {
        await deleteFromS3(key);
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ error: "Failed to delete image" });
    }
  });
}
