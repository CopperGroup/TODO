import { useState } from "react";

const useDeleteFile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractPublicId = (url: string) => {
    const regex = /\/upload\/(.*?)(\.[a-zA-Z0-9]+)$/;
    const match = url.match(regex);
    return match ? match[1] : null; // Extract the public_id part
  };

  const deleteFile = async (url: string) => {
    const publicId = extractPublicId(url);
    if (!publicId) {
      setError("Invalid Cloudinary URL");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/deleteFile", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publicId }),
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        console.log("File deleted successfully:", data);
      }
    } catch (err) {
      setError("Failed to delete the file");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteFile, isLoading, error };
};

export default useDeleteFile;
