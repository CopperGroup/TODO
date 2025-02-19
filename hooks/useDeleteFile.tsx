import { useState } from "react";

export function useDeleteFile () {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);



  const deleteFile = async (url: string) => {

    setIsLoading(true);
    try {
      const response = await fetch("/api/deleteFile", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
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
