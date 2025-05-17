"use client";

import type React from 'react';
import { useState, useCallback } from 'react';
import { UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface FileDropzoneProps {
  onFilesAdded: (files: File[]) => void;
  disabled?: boolean;
}

export function FileDropzone({ onFilesAdded, disabled }: FileDropzoneProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      onFilesAdded(filesArray);
      event.target.value = ''; // Reset input
    }
  };

  const handleDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled) {
      setIsDraggingOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled && event.dataTransfer) {
       event.dataTransfer.dropEffect = 'copy';
    }
  }, [disabled]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
    if (disabled) return;

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const filesArray = Array.from(files);
      onFilesAdded(filesArray);
    }
  }, [onFilesAdded, disabled]);

  const handleClick = () => {
    if (!disabled) {
      document.getElementById('fileInput')?.click();
    }
  };

  return (
    <Card 
      className={cn(
        "border-2 border-dashed hover:border-accent transition-colors duration-200 ease-in-out",
        isDraggingOver && !disabled ? "border-accent bg-accent/10" : "border-input",
        disabled ? "bg-muted/50 cursor-not-allowed" : "cursor-pointer bg-card"
      )}
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      role="button"
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
    >
      <CardContent className="p-6 text-center">
        <input
          type="file"
          id="fileInput"
          multiple
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
          accept="image/*,application/pdf,text/*,application/zip,application/x-rar-compressed" 
        />
        <UploadCloud 
          className={cn(
            "mx-auto h-16 w-16 mb-4",
            isDraggingOver && !disabled ? "text-accent" : "text-muted-foreground",
            disabled ? "text-muted-foreground/50" : ""
          )} 
        />
        <p className={cn(
            "text-lg font-semibold mb-1",
            isDraggingOver && !disabled ? "text-accent" : "text-foreground",
             disabled ? "text-muted-foreground/70" : ""
          )}
        >
          Drag & Drop files here
        </p>
        <p className={cn(
            "text-sm",
            disabled ? "text-muted-foreground/70" : "text-muted-foreground"
          )}
        >
          or click to browse. Images will be processed with OCR.
        </p>
      </CardContent>
    </Card>
  );
}
