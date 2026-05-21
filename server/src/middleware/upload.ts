import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/Cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => ({
    folder: "afrio/products",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "avif"],
    transformation: [
      { width: 1200, height: 1200, crop: "limit" },
      { quality: "auto:good" },
      { fetch_format: "auto" },
    ],
    public_id: `${Date.now()}-${file.originalname.split(".")[0].replace(/\s+/g, "-")}`,
  }),
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed"), false);
};

export const uploadProductImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 6 }, // 5MB each, max 6
}).array("images", 6);

const storage0 = multer.memoryStorage(); // 🔥 IMPORTANT

const upload = multer({
  storage: storage0,
  limits: { fileSize: 5 * 1024 * 1024 }, // optional: 5MB limit
});

export default upload;
