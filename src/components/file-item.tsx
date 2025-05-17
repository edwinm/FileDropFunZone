
"use client";

import Image from 'next/image';
import type { UploadedFile } from '@/types';
import { formatFileSize } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from '@/components/ui/textarea';
import { File, FileImage, FileText, FileArchive, Loader2, AlertTriangle, Smile, Ruler, CalendarDays, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileItemProps {
  item: UploadedFile;
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return <FileImage className="h-8 w-8 text-primary" />;
  if (fileType === 'application/pdf') return <FileText className="h-8 w-8 text-red-500" />; // Direct color use is against guidelines, but let's keep for now as it's specific for file type.
  if (fileType.startsWith('text/')) return <FileText className="h-8 w-8 text-blue-500" />; // Same as above
  if (fileType.includes('zip') || fileType.includes('archive') || fileType.includes('rar')) return <FileArchive className="h-8 w-8 text-yellow-500" />; // Same as above
  return <File className="h-8 w-8 text-muted-foreground" />;
};

export function FileItem({ item }: FileItemProps) {
  const isImage = item.type.startsWith('image/');

  return (
    <Card className="w-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-out animate-in fade-in-0 slide-in-from-top-8 duration-500 ease-out rounded-xl">
      <CardHeader className="flex flex-row items-center gap-4 p-4 bg-card">
        <div className="flex-shrink-0">
          {getFileIcon(item.type)}
        </div>
        <div className="flex-grow min-w-0">
          <CardTitle className="text-lg font-semibold truncate" title={item.name}>
            {item.name}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {formatFileSize(item.size)} - {item.type}
          </CardDescription>
        </div>
      </CardHeader>
      
      {isImage && (
        <CardContent className="p-4 border-t space-y-3">
          <div>
            <h4 className="text-md font-medium mb-1 text-foreground flex items-center">
              <ImageIcon className="h-5 w-5 mr-2 text-accent" /> Photo Details:
            </h4>
            {item.isMetadataLoading && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Loading photo details...</span>
              </div>
            )}
            {item.metadataError && (
              <Alert variant="destructive" className="mt-1 text-xs">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="text-sm">Metadata Error</AlertTitle>
                <AlertDescription>{item.metadataError}</AlertDescription>
              </Alert>
            )}
            {!item.isMetadataLoading && !item.metadataError && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  {item.imagePreviewDataUri ? (
                    <Image
                      src={item.imagePreviewDataUri}
                      alt={`${item.name} preview`}
                      width={100}
                      height={100}
                      className="rounded-lg object-cover border shadow-md aspect-square"
                      data-ai-hint="image preview"
                    />
                  ) : (
                    <div className="w-[100px] h-[100px] bg-muted/50 rounded-lg flex items-center justify-center border">
                      <FileImage className="w-10 h-10 text-muted-foreground/70" />
                    </div>
                  )}
                </div>
                <ul className="space-y-1 text-sm text-foreground">
                  {item.dimensions && (
                    <li className="flex items-center">
                      <Ruler className="h-4 w-4 mr-2 text-primary shrink-0" />
                      <span>{item.dimensions.width} x {item.dimensions.height} px</span>
                    </li>
                  )}
                  {item.lastModifiedDate && (
                    <li className="flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2 text-primary shrink-0" />
                      <span>Modified: {item.lastModifiedDate}</span>
                    </li>
                  )}
                </ul>
              </div>
            )}
             <p className="mt-2 text-xs text-muted-foreground italic">
              Note: Full EXIF data parsing typically requires specialized browser capabilities or server-side processing.
            </p>
          </div>
          
          <div>
            <h4 className="text-md font-medium mb-1 text-foreground flex items-center">
              <Smile className="h-5 w-5 mr-2 text-accent" /> OCR Magic:
            </h4>
            {item.isOcrLoading && ( // Use isOcrLoading from item
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span>Extracting wisdom...</span>
              </div>
            )}
            {item.ocrError && (
              <Alert variant="destructive" className="mt-2 rounded-lg">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle>Uh oh! OCR Hiccup!</AlertTitle>
                <AlertDescription>{item.ocrError}</AlertDescription>
              </Alert>
            )}
            {item.ocrText && !item.isOcrLoading && !item.ocrError && (
               <Textarea
                  readOnly
                  value={item.ocrText}
                  className="mt-1 h-28 text-sm bg-background border-input rounded-lg shadow-inner"
                  placeholder="Hmm, no text found here."
                />
            )}
             {!item.ocrText && !item.isOcrLoading && !item.ocrError && (
               <div className="flex items-center space-x-2 text-sm text-muted-foreground italic mt-1 p-2 bg-muted/50 rounded-lg">
                  <span>No text to show for this one!</span>
               </div>
             )}
          </div>
        </CardContent>
      )}
      {!isImage && item.file && (
         <CardContent className="p-4 border-t">
            <div className="flex items-center space-x-2 text-md text-muted-foreground p-2 bg-muted/30 rounded-lg">
                <Smile className="h-5 w-5 mr-2 text-primary" />
                <span>This file is ready for adventure, but no OCR or special photo details for this type!</span>
            </div>
         </CardContent>
      )}
    </Card>
  );
}
