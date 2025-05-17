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
import { Trash2, RotateCcw, Sparkles } from 'lucide-react'; // Added Sparkles icon

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
        title: "✨ OCR Success! ✨",
        description: `Woohoo! Text extracted from ${file.name}.`,
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
        title: "😬 OCR Oopsie!",
        description: `Couldn't find text in ${file.name}: ${errorMessage}`,
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
      isOcrLoading: file.type.startsWith('image/'), 
    }));

    setUploadedFiles(prevFiles => [...newFiles, ...prevFiles]);
    
    toast({
      title: `📬 ${files.length} File(s) Dropped In!`,
      description: "Let's see what treasures they hold (running OCR on images)...",
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
      title: "💨 Poof! All Files Gone!",
      description: "The file list is sparkling clean.",
    });
  };
  
  const resetApplication = () => {
    clearAllFiles();
    toast({
        title: "🎉 Fresh Start!",
        description: "FileDrop FunZone is reset and ready for more action!",
    });
  };


  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 md:p-8 selection:bg-accent selection:text-accent-foreground">
      <div className="w-full max-w-4xl space-y-6"> {/* Reduced space-y slightly */}
        <header className="text-center space-y-2 py-6">
          <h1 className="text-5xl font-bold text-primary tracking-tight flex items-center justify-center">
            <Sparkles className="h-10 w-10 mr-3 text-accent animate-pulse" /> {/* Added icon and animation */}
            FileDrop <span className="text-accent">FunZone!</span>
          </h1>
          <p className="text-muted-foreground text-xl"> {/* Larger text */}
            Drag, drop, and discover the magic within your files!
          </p>
        </header>

        <FileDropzone onFilesAdded={handleFilesAdded} disabled={isProcessing} />
        
        <Separator className="my-6" /> {/* Adjusted margin */}

        {uploadedFiles.length > 0 && (
          <div className="flex justify-end space-x-3 mb-4"> {/* Increased space */}
             <Button variant="outline" onClick={resetApplication} disabled={isProcessing || uploadedFiles.length === 0} className="rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <RotateCcw className="mr-2 h-5 w-5" /> Reset FunZone
            </Button>
            <Button variant="destructive" onClick={clearAllFiles} disabled={isProcessing || uploadedFiles.length === 0} className="rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <Trash2 className="mr-2 h-5 w-5" /> Clear All Files
            </Button>
          </div>
        )}
        
        <FileList files={uploadedFiles} />
        
        <footer className="text-center text-md text-muted-foreground mt-10 py-6 border-t"> {/* Adjusted spacing and text size */}
          <p>&copy; {new Date().getFullYear()} FileDrop FunZone. Built with Next.js, GenAI, and a sprinkle of joy!</p>
        </footer>
      </div>
    </main>
  );
}
