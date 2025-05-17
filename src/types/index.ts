export interface UploadedFile {
  id: string; // Unique ID for the file entry
  file: File; // The actual File object
  name: string;
  size: number; // in bytes
  type: string; // MIME type
  lastModifiedDate?: string; // Formatted last modified date
  dimensions?: { width: number; height: number };
  imagePreviewDataUri?: string; // Data URI for preview and dimension extraction
  isMetadataLoading?: boolean;
  metadataError?: string;
  ocrText?: string;
  isOcrLoading?: boolean;
  ocrError?: string;
  exifData?: Record<string, any>; // To store parsed EXIF data
  isExifLoading?: boolean;
  exifError?: string;
}
