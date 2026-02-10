import { useState } from "react";

// Stub for uploadthing - media upload not supported in desktop version yet
export function useUploadFile() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    key: string;
    url: string;
    name: string;
    size: number;
  } | null>(null);

  const uploadFile = async (_file: File) => {
    setIsUploading(true);
    // TODO: implement local file storage via Tauri
    setIsUploading(false);
    return null;
  };

  return {
    isUploading,
    uploadedFile,
    uploadFile,
    progresses: {} as Record<string, number>,
    uploadFiles: async (_files: File[]) => {
      return [];
    },
  };
}
