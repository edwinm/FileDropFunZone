"use client";

import type React from 'react';
import { useState, useCallback } from 'react';
import { UploadCloud, Box } from 'lucide-react'; // Added Box icon for playful theme
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
        "border-4 border-dashed rounded-2xl shadow-inner-lg transition-all duration-300 ease-out",
        isDraggingOver && !disabled 
          ? "border-accent scale-105 bg-accent/10 ring-4 ring-accent/30 transform" 
          : "border-input hover:border-primary/70",
        disabled ? "bg-muted/50 cursor-not-allowed opacity-70" : "cursor-pointer bg-card hover:shadow-lg"
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
      <CardContent className="p-8 text-center flex flex-col items-center justify-center space-y-4">
        <input
          type="file"
          id="fileInput"
          multiple
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
          accept="image/*,application/pdf,text/*,application/zip,application/x-rar-compressed" 
        />
        <Box // Changed icon to Box
          className={cn(
            "mx-auto h-24 w-24 mb-2 transition-transform duration-200 ease-in-out",
            isDraggingOver && !disabled ? "text-accent scale-110" : "text-primary",
            disabled ? "text-muted-foreground/50" : ""
          )} 
        />
        <p className={cn(
            "text-xl font-bold", // Made text bolder and larger
            isDraggingOver && !disabled ? "text-accent" : "text-foreground",
             disabled ? "text-muted-foreground/70" : ""
          )}
        >
          Drop your awesome files here!
        </p>
        <p className={cn(
            "text-md", // Slightly larger subtext
            disabled ? "text-muted-foreground/70" : "text-muted-foreground"
          )}
        >
          Or click to pick some goodies. Images get OCR'd!
        </p>
      </CardContent>
    </Card>
  );
}
