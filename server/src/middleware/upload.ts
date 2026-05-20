import multer from "multer";

const storage = multer.memoryStorage(); // 🔥 IMPORTANT

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // optional: 5MB limit
});

export default upload;