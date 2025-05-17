
"use client";

import { useState, useCallback } from 'react';
import type { UploadedFile } from '@/types';
import { FileDropzone } from '@/components/file-dropzone';
import { FileList } from '@/components/file-list';
import { ocrImageFile } from '@/ai/flows/ocr-image-file';
import { translateAndIdentifyLanguage } from '@/ai/flows/translate-and-identify-language-flow';
import { fileToDataUri } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Trash2, RotateCcw, Sparkles } from 'lucide-react';
import EXIF from 'exif-js';

export default function HomePage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessingDrop, setIsProcessingDrop] = useState(false);
  const { toast } = useToast();

  const handleImageMetadata = async (fileId: string, dataUri: string) => {
    setUploadedFiles(prevFiles =>
      prevFiles.map(f =>
        f.id === fileId ? { ...f, isMetadataLoading: true } : f
      )
    );

    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        setUploadedFiles(prevFiles =>
          prevFiles.map(f =>
            f.id === fileId
              ? {
                  ...f,
                  dimensions: { width: img.naturalWidth, height: img.naturalHeight },
                  isMetadataLoading: false,
                }
              : f
          )
        );
        resolve();
      };
      img.onerror = () => {
        setUploadedFiles(prevFiles =>
          prevFiles.map(f =>
            f.id === fileId
              ? {
                  ...f,
                  metadataError: 'Could not load image to get dimensions.',
                  isMetadataLoading: false,
                }
              : f
          )
        );
        resolve(); 
      };
      img.src = dataUri;
    });
  };

  const handleTranslation = async (fileId: string, textToTranslate: string, originalFileName: string) => {
    if (!textToTranslate || textToTranslate.trim() === "") {
      setUploadedFiles(prevFiles =>
        prevFiles.map(f =>
          f.id === fileId ? { 
            ...f, 
            isTranslationLoading: false, 
            translatedOcrText: "",
            detectedSourceLanguage: "N/A",
            isTranslationNeeded: false,
          } : f
        )
      );
      return;
    }

    try {
      const translationResult = await translateAndIdentifyLanguage({ text: textToTranslate });
      setUploadedFiles(prevFiles =>
        prevFiles.map(f =>
          f.id === fileId ? { 
            ...f, 
            translatedOcrText: translationResult.translatedText,
            detectedSourceLanguage: translationResult.sourceLanguage,
            isTranslationNeeded: translationResult.isTranslationNeeded,
            isTranslationLoading: false 
          } : f
        )
      );
      if (translationResult.isTranslationNeeded) {
        toast({
          title: "🌍 Translation Complete!",
          description: `Text from ${originalFileName} (detected as ${translationResult.sourceLanguage}) translated to English.`,
        });
      }
    } catch (error) {
      console.error('Translation Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown translation error';
      setUploadedFiles(prevFiles =>
        prevFiles.map(f =>
          f.id === fileId ? { ...f, translationError: errorMessage, isTranslationLoading: false } : f
        )
      );
      toast({
        title: "🚧 Translation Trouble!",
        description: `Could not translate text from ${originalFileName}: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const handleOcr = async (fileId: string, dataUri: string, originalFileName: string) => {
    try {
      const result = await ocrImageFile({ photoDataUri: dataUri });
      setUploadedFiles(prevFiles =>
        prevFiles.map(f =>
          f.id === fileId ? { ...f, ocrText: result.extractedText, isOcrLoading: false, isTranslationLoading: !!result.extractedText } : f
        )
      );
      toast({
        title: "✨ OCR Success! ✨",
        description: `Text extracted from ${originalFileName}. Translating if needed...`,
      });

      if (result.extractedText) {
        await handleTranslation(fileId, result.extractedText, originalFileName);
      } else {
         // No text from OCR, so no translation needed
        setUploadedFiles(prevFiles =>
          prevFiles.map(f =>
            f.id === fileId ? { ...f, isTranslationLoading: false, detectedSourceLanguage: 'N/A', isTranslationNeeded: false } : f
          )
        );
      }
    } catch (error) {
      console.error('OCR Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown OCR error';
      setUploadedFiles(prevFiles =>
        prevFiles.map(f =>
          f.id === fileId ? { ...f, ocrError: errorMessage, isOcrLoading: false, isTranslationLoading: false } : f
        )
      );
      toast({
        title: "😬 OCR Oopsie!",
        description: `Couldn't find text in ${originalFileName}: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const handleExifData = async (fileId: string, file: File) => {
    setUploadedFiles(prevFiles =>
      prevFiles.map(f =>
        f.id === fileId ? { ...f, isExifLoading: true, exifError: undefined } : f
      )
    );
    try {
      const exifData = await new Promise<Record<string, any> | null>((resolve, reject) => {
        EXIF.getData(file as any, function(this: any) {
          try {
            const allTags = EXIF.getAllTags(this);
            if (allTags && Object.keys(allTags).length > 0) {
              resolve(allTags);
            } else {
              resolve(null); 
            }
          } catch (e) {
            console.error("Error processing EXIF tags:", e);
            reject(new Error("Failed to process EXIF tags."));
          }
        });
      });

      if (exifData) {
        setUploadedFiles(prevFiles =>
          prevFiles.map(f =>
            f.id === fileId ? { ...f, exifData, isExifLoading: false } : f
          )
        );
        toast({
          title: "📸 EXIF Data Found!",
          description: `Extracted EXIF metadata from ${file.name}.`,
        });
      } else {
        setUploadedFiles(prevFiles =>
          prevFiles.map(f =>
            f.id === fileId ? { ...f, exifError: "No EXIF data found or file is not an image with EXIF.", isExifLoading: false } : f
          )
        );
      }
    } catch (error) {
      console.error('EXIF Data Extraction Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown EXIF extraction error';
      setUploadedFiles(prevFiles =>
        prevFiles.map(f =>
          f.id === fileId ? { ...f, exifError: errorMessage, isExifLoading: false } : f
        )
      );
      toast({
        title: "💔 EXIF Extraction Failed",
        description: `Could not extract EXIF data from ${file.name}: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };


  const handleFilesAdded = useCallback(async (files: File[]) => {
    setIsProcessingDrop(true);
    
    const newUploadedFiles: UploadedFile[] = files.map(file => {
      const isImage = file.type.startsWith('image/');
      return {
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        lastModifiedDate: new Date(file.lastModified).toLocaleDateString(),
        isMetadataLoading: isImage,
        isOcrLoading: isImage,
        isExifLoading: isImage, 
        isTranslationLoading: false, // Initialize translation loading state
      };
    });

    setUploadedFiles(prevFiles => [...newUploadedFiles, ...prevFiles]);
    setIsProcessingDrop(false); 

    toast({
      title: `📬 ${files.length} File(s) Dropped In!`,
      description: "Let's see what treasures they hold (processing images)...",
    });

    for (const uploadedFile of newUploadedFiles) {
      if (uploadedFile.type.startsWith('image/')) {
        try {
          const dataUri = await fileToDataUri(uploadedFile.file);
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === uploadedFile.id ? { ...f, imagePreviewDataUri: dataUri } : f
            )
          );

          // Set OCR loading to true, translation will be set inside handleOcr
          setUploadedFiles(prev => prev.map(f => f.id === uploadedFile.id ? { ...f, isOcrLoading: true } : f));

          await Promise.all([
            handleImageMetadata(uploadedFile.id, dataUri),
            handleOcr(uploadedFile.id, dataUri, uploadedFile.name), // This will trigger translation
            handleExifData(uploadedFile.id, uploadedFile.file)
          ]);

        } catch (error) {
          console.error('Error processing file for metadata/OCR/EXIF/Translation:', uploadedFile.name, error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to read file for processing.';
          setUploadedFiles(prevFiles =>
            prevFiles.map(f =>
              f.id === uploadedFile.id 
                ? { 
                    ...f, 
                    metadataError: f.metadataError || errorMessage, 
                    ocrError: f.ocrError || errorMessage, 
                    exifError: f.exifError || errorMessage,
                    translationError: f.translationError || errorMessage,
                    isMetadataLoading: false, 
                    isOcrLoading: false,
                    isExifLoading: false,
                    isTranslationLoading: false,
                  } 
                : f
            )
          );
        }
      }
    }
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
      <div className="w-full max-w-4xl space-y-6">
        <header className="text-center space-y-2 py-6">
          <h1 className="text-5xl font-bold text-primary tracking-tight flex items-center justify-center">
            <Sparkles className="h-10 w-10 mr-3 text-accent animate-pulse" />
            FileDrop <span className="text-accent">FunZone!</span>
          </h1>
          <p className="text-muted-foreground text-xl">
            Drag, drop, and discover the magic within your files!
          </p>
        </header>

        <FileDropzone onFilesAdded={handleFilesAdded} disabled={isProcessingDrop} />
        
        <Separator className="my-6" />

        {uploadedFiles.length > 0 && (
          <div className="flex justify-end space-x-3 mb-4">
             <Button variant="outline" onClick={resetApplication} disabled={isProcessingDrop || uploadedFiles.length === 0} className="rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <RotateCcw className="mr-2 h-5 w-5" /> Reset FunZone
            </Button>
            <Button variant="destructive" onClick={clearAllFiles} disabled={isProcessingDrop || uploadedFiles.length === 0} className="rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <Trash2 className="mr-2 h-5 w-5" /> Clear All Files
            </Button>
          </div>
        )}
        
        <FileList files={uploadedFiles} />
        
        <footer className="text-center text-md text-muted-foreground mt-10 py-6 border-t">
          <p>&copy; {new Date().getFullYear()} FileDrop FunZone. Built with Next.js, GenAI, and a sprinkle of joy!</p>
        </footer>
      </div>
    </main>
  );
}
