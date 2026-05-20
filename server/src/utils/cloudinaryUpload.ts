import cloudinary from "../config/Cloudinary";

export const uploadToCloudinary = (buffer: Buffer): Promise<any> => {
  return new Promise((resolve, reject) => {
    console.log("📤 Starting Cloudinary upload...");

    const stream = cloudinary.uploader.upload_stream(
      { folder: "afrio" },
      (error, result) => {
        if (error) {
          console.error("❌ Cloudinary error:", error);
          return reject(error);
        }

        console.log("✅ Uploaded:", result?.secure_url);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};