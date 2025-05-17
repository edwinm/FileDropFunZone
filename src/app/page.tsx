"use client";

import { useState, useCallback } from 'react';
import type { UploadedFile } from '@/types';
import { FileDropzone } from '@/components/file-dropzone';
import { FileList } from '@/components/file-list';
import { ocrImageFile } from '@/ai/flows/ocr-image-file';
import { fileToDataUri } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Trash2, RotateCcw } from 'lucide-react';

export default function HomePage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleOcr = async (fileId: string, file: File) => {
    try {
      const dataUri = await fileToDataUri(file);
      const result = await ocrImageFile({ photoDataUri: dataUri });
      setUploadedFiles(prevFiles =>
        prevFiles.map(f =>
          f.id === fileId ? { ...f, ocrText: result.extractedText, isOcrLoading: false } : f
        )
      );
      toast({
        title: "OCR Success",
        description: `Text extracted from ${file.name}.`,
        variant: "default",
      });
    } catch (error) {
      console.error('OCR Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown OCR error';
      setUploadedFiles(prevFiles =>
        prevFiles.map(f =>
          f.id === fileId ? { ...f, ocrError: errorMessage, isOcrLoading: false } : f
        )
      );
      toast({
        title: "OCR Failed",
        description: `Could not extract text from ${file.name}: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const handleFilesAdded = useCallback(async (files: File[]) => {
    setIsProcessing(true);
    const newFiles: UploadedFile[] = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      isOcrLoading: file.type.startsWith('image/'), // Set loading only for images
    }));

    setUploadedFiles(prevFiles => [...newFiles, ...prevFiles]);
    
    toast({
      title: `${files.length} file(s) added`,
      description: "Processing images for OCR if any.",
    });

    for (const newFile of newFiles) {
      if (newFile.type.startsWith('image/')) {
        await handleOcr(newFile.id, newFile.file);
      }
    }
    setIsProcessing(false);
  }, [toast]);

  const clearAllFiles = () => {
    setUploadedFiles([]);
    toast({
      title: "All files cleared",
      description: "The file list is now empty.",
    });
  };
  
  const resetApplication = () => {
    clearAllFiles();
    // Potentially add more reset logic here if needed
    toast({
        title: "Application Reset",
        description: "FileDrop Explorer has been reset to its initial state.",
    });
  };


  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 md:p-8 selection:bg-accent selection:text-accent-foreground">
      <div className="w-full max-w-4xl space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-primary tracking-tight">
            FileDrop <span className="text-accent">Explorer</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Drag, drop, and discover the content within your files.
          </p>
        </header>

        <FileDropzone onFilesAdded={handleFilesAdded} disabled={isProcessing} />
        
        <Separator />

        {uploadedFiles.length > 0 && (
          <div className="flex justify-end space-x-2 mb-4">
             <Button variant="outline" onClick={resetApplication} disabled={isProcessing || uploadedFiles.length === 0}>
              <RotateCcw className="mr-2 h-4 w-4" /> Reset App
            </Button>
            <Button variant="destructive" onClick={clearAllFiles} disabled={isProcessing || uploadedFiles.length === 0}>
              <Trash2 className="mr-2 h-4 w-4" /> Clear All Files
            </Button>
          </div>
        )}
        
        <FileList files={uploadedFiles} />
        
        <footer className="text-center text-sm text-muted-foreground mt-12 py-4 border-t">
          <p>&copy; {new Date().getFullYear()} FileDrop Explorer. Powered by Next.js & GenAI.</p>
        </footer>
      </div>
    </main>
  );
}
