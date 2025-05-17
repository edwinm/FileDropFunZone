export interface UploadedFile {
  id: string; // Unique ID for the file entry
  file: File; // The actual File object
  name: string;
  size: number; // in bytes
  type: string; // MIME type
  ocrText?: string;
  isOcrLoading?: boolean;
  ocrError?: string;
}
