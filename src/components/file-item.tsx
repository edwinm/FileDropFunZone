"use client";

import type { UploadedFile } from '@/types';
import { formatFileSize } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from '@/components/ui/textarea';
import { Progress } from "@/components/ui/progress";
import { File, FileImage, FileText, FileArchive, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileItemProps {
  item: UploadedFile;
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return <FileImage className="h-6 w-6 text-primary" />;
  if (fileType === 'application/pdf') return <FileText className="h-6 w-6 text-red-500" />; // Example of specific color
  if (fileType.startsWith('text/')) return <FileText className="h-6 w-6 text-blue-500" />;
  if (fileType.includes('zip') || fileType.includes('archive') || fileType.includes('rar')) return <FileArchive className="h-6 w-6 text-yellow-500" />;
  return <File className="h-6 w-6 text-muted-foreground" />;
};

export function FileItem({ item }: FileItemProps) {
  const isImage = item.type.startsWith('image/');

  return (
    <Card className="w-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200 ease-in-out animate-in fade-in-50 slide-in-from-bottom-5">
      <CardHeader className="flex flex-row items-center gap-4 p-4 bg-card">
        <div className="flex-shrink-0">
          {getFileIcon(item.type)}
        </div>
        <div className="flex-grow min-w-0">
          <CardTitle className="text-base font-semibold truncate" title={item.name}>
            {item.name}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {formatFileSize(item.size)} - {item.type}
          </CardDescription>
        </div>
      </CardHeader>
      
      {isImage && (
        <CardContent className="p-4 border-t">
          <h4 className="text-sm font-medium mb-2 text-foreground">OCR Results:</h4>
          {item.isOcrLoading && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Processing OCR...</span>
            </div>
          )}
          {item.ocrError && (
            <Alert variant="destructive" className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>OCR Error</AlertTitle>
              <AlertDescription>{item.ocrError}</AlertDescription>
            </Alert>
          )}
          {item.ocrText && !item.isOcrLoading && !item.ocrError && (
             <Textarea
                readOnly
                value={item.ocrText}
                className="mt-1 h-32 text-sm bg-background border-input rounded-md shadow-inner"
                placeholder="No text extracted or file is not an image."
              />
          )}
           {!item.ocrText && !item.isOcrLoading && !item.ocrError && (
             <div className="flex items-center space-x-2 text-sm text-muted-foreground italic mt-1">
                <span>No text extracted or not an image for OCR.</span>
             </div>
           )}
        </CardContent>
      )}
    </Card>
  );
}
