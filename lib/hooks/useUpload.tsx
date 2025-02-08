"use cleint";

import { useState } from "react";
import axios from "axios";

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = async (files: File[]) => {
    setIsUploading(true);
    setUploadedUrls([]);
    setError(null);

    if (!Array.isArray(files)) {
      files = [files]; // Ensure it's an array
    }

    try {
      const uploadedUrls: string[] = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", "upload_preset"); // Replace with your unsigned preset

          const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/upload`,
            formData
          );

          return response.data.secure_url;
        })
      );

      setUploadedUrls(uploadedUrls);
      return uploadedUrls; // Return URLs for further use if needed
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Failed to upload files.");
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFiles, uploadedUrls, isUploading, error };
}
