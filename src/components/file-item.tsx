"use client";

import type { UploadedFile } from '@/types';
import { formatFileSize } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from '@/components/ui/textarea';
import { Progress } from "@/components/ui/progress";
import { File, FileImage, FileText, FileArchive, Loader2, AlertTriangle, CheckCircle2, Smile } from 'lucide-react'; // Added Smile icon
import { cn } from '@/lib/utils';

interface FileItemProps {
  item: UploadedFile;
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return <FileImage className="h-8 w-8 text-primary" />; // Made icon slightly larger
  if (fileType === 'application/pdf') return <FileText className="h-8 w-8 text-red-500" />;
  if (fileType.startsWith('text/')) return <FileText className="h-8 w-8 text-blue-500" />;
  if (fileType.includes('zip') || fileType.includes('archive') || fileType.includes('rar')) return <FileArchive className="h-8 w-8 text-yellow-500" />;
  return <File className="h-8 w-8 text-muted-foreground" />;
};

export function FileItem({ item }: FileItemProps) {
  const isImage = item.type.startsWith('image/');

  return (
    <Card className="w-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-out animate-in fade-in-0 slide-in-from-top-8 duration-500 ease-out rounded-xl"> {/* Changed animation and rounded corners */}
      <CardHeader className="flex flex-row items-center gap-4 p-4 bg-card">
        <div className="flex-shrink-0">
          {getFileIcon(item.type)}
        </div>
        <div className="flex-grow min-w-0">
          <CardTitle className="text-lg font-semibold truncate" title={item.name}> {/* Larger title */}
            {item.name}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground"> {/* Slightly larger description */}
            {formatFileSize(item.size)} - {item.type}
          </CardDescription>
        </div>
      </CardHeader>
      
      {isImage && (
        <CardContent className="p-4 border-t">
          <h4 className="text-md font-medium mb-2 text-foreground flex items-center"> {/* Larger OCR title */}
            <Smile className="h-5 w-5 mr-2 text-accent" /> OCR Magic: {/* Added icon and playful text */}
          </h4>
          {item.isOcrLoading && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" /> {/* Larger loader */}
              <span>Extracting wisdom...</span> {/* Playful text */}
            </div>
          )}
          {item.ocrError && (
            <Alert variant="destructive" className="mt-2 rounded-lg"> {/* Rounded alert */}
              <AlertTriangle className="h-5 w-5" /> {/* Larger icon */}
              <AlertTitle>Uh oh! OCR Hiccup!</AlertTitle> {/* Playful title */}
              <AlertDescription>{item.ocrError}</AlertDescription>
            </Alert>
          )}
          {item.ocrText && !item.isOcrLoading && !item.ocrError && (
             <Textarea
                readOnly
                value={item.ocrText}
                className="mt-1 h-36 text-sm bg-background border-input rounded-lg shadow-inner" /* Rounded textarea, slightly taller */
                placeholder="Hmm, no text found here or not an image." /* Playful placeholder */
              />
          )}
           {!item.ocrText && !item.isOcrLoading && !item.ocrError && (
             <div className="flex items-center space-x-2 text-sm text-muted-foreground italic mt-1 p-2 bg-muted/50 rounded-lg"> {/* Styled message for no text */}
                <span>No text to show for this one!</span>
             </div>
           )}
        </CardContent>
      )}
      {!isImage && item.file && ( // Display for non-image files
         <CardContent className="p-4 border-t">
            <div className="flex items-center space-x-2 text-md text-muted-foreground p-2 bg-muted/30 rounded-lg">
                <Smile className="h-5 w-5 mr-2 text-primary" />
                <span>This file is ready for adventure, but no OCR for this type!</span>
            </div>
         </CardContent>
      )}
    </Card>
  );
}
