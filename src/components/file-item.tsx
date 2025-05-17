
"use client";

import Image from 'next/image';
import type { UploadedFile } from '@/types';
import { formatFileSize } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from '@/components/ui/textarea';
import { File, FileImage, FileText, FileArchive, Loader2, AlertTriangle, Smile, Ruler, CalendarDays, Image as ImageIcon, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileItemProps {
  item: UploadedFile;
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return <FileImage className="h-8 w-8 text-primary" />;
  if (fileType === 'application/pdf') return <FileText className="h-8 w-8 text-red-500" />;
  if (fileType.startsWith('text/')) return <FileText className="h-8 w-8 text-blue-500" />;
  if (fileType.includes('zip') || fileType.includes('archive') || fileType.includes('rar')) return <FileArchive className="h-8 w-8 text-yellow-500" />;
  return <File className="h-8 w-8 text-muted-foreground" />;
};

const interpretOrientation = (orientation?: number | string): string => {
  if (orientation === undefined) return "N/A";
  const numOrientation = Number(orientation);
  switch (numOrientation) {
    case 1: return "Normal (1)";
    case 2: return "Mirror horizontal (2)";
    case 3: return "Rotate 180° (3)";
    case 4: return "Mirror vertical (4)";
    case 5: return "Mirror horizontal, rotate 270° CW (5)";
    case 6: return "Rotate 90° CW (6)";
    case 7: return "Mirror horizontal, rotate 90° CW (7)";
    case 8: return "Rotate 270° CW (8)";
    default: return `Unknown (${orientation})`;
  }
};

const formatFNumber = (fNumber?: any): string => {
  if (typeof fNumber === 'number') return `f/${fNumber.toFixed(1)}`;
  if (fNumber && typeof fNumber.numerator === 'number' && typeof fNumber.denominator === 'number' && fNumber.denominator !== 0) {
    return `f/${(fNumber.numerator / fNumber.denominator).toFixed(1)}`;
  }
  return "N/A";
};

const formatExposureTime = (exposureTime?: any): string => {
  if (typeof exposureTime === 'number') {
    if (exposureTime < 1) {
      return `1/${Math.round(1 / exposureTime)} s`;
    }
    return `${exposureTime.toFixed(2)} s`;
  }
   if (exposureTime && typeof exposureTime.numerator === 'number' && typeof exposureTime.denominator === 'number' && exposureTime.denominator !== 0) {
    const val = exposureTime.numerator / exposureTime.denominator;
    if (val < 1) {
       return `1/${Math.round(1 / val)} s`;
    }
    return `${val.toFixed(2)} s`;
  }
  return "N/A";
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
        <CardContent className="p-4 border-t space-y-4">
          <div>
            <h4 className="text-md font-medium mb-2 text-foreground flex items-center">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 items-start">
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
                <ul className="space-y-1 text-sm text-foreground mt-2 md:mt-0">
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
          </div>
          
          <div>
            <h4 className="text-md font-medium mb-2 text-foreground flex items-center">
              <Camera className="h-5 w-5 mr-2 text-accent" /> EXIF Insights:
            </h4>
            {item.isExifLoading && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Loading EXIF data...</span>
              </div>
            )}
            {item.exifError && (
              <Alert variant="destructive" className="mt-1 text-xs">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="text-sm">EXIF Error</AlertTitle>
                <AlertDescription>{item.exifError}</AlertDescription>
              </Alert>
            )}
            {item.exifData && !item.isExifLoading && !item.exifError && (
              <ul className="space-y-0.5 text-xs text-foreground bg-muted/20 p-3 rounded-md shadow-inner">
                {item.exifData.Make && <li><strong>Make:</strong> {String(item.exifData.Make)}</li>}
                {item.exifData.Model && <li><strong>Model:</strong> {String(item.exifData.Model)}</li>}
                {item.exifData.DateTimeOriginal && <li><strong>Date Taken:</strong> {String(item.exifData.DateTimeOriginal)}</li>}
                {item.exifData.FNumber && <li><strong>F-Number:</strong> {formatFNumber(item.exifData.FNumber)}</li>}
                {item.exifData.ExposureTime && <li><strong>Exposure Time:</strong> {formatExposureTime(item.exifData.ExposureTime)}</li>}
                {item.exifData.ISOSpeedRatings && <li><strong>ISO:</strong> {String(item.exifData.ISOSpeedRatings)}</li>}
                {item.exifData.Orientation && <li><strong>Orientation:</strong> {interpretOrientation(item.exifData.Orientation)}</li>}
              </ul>
            )}
            {!item.exifData && !item.isExifLoading && !item.exifError && (
               <div className="flex items-center space-x-2 text-sm text-muted-foreground italic mt-1 p-2 bg-muted/30 rounded-lg">
                  <span>No EXIF data to show for this one!</span>
               </div>
            )}
          </div>

          <div>
            <h4 className="text-md font-medium mb-1 text-foreground flex items-center">
              <Smile className="h-5 w-5 mr-2 text-accent" /> OCR Magic:
            </h4>
            {item.isOcrLoading && ( 
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
               <div className="flex items-center space-x-2 text-sm text-muted-foreground italic mt-1 p-2 bg-muted/30 rounded-lg">
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
                <span>This file is ready for adventure, but no OCR, photo details, or EXIF insights for this type!</span>
            </div>
         </CardContent>
      )}
    </Card>
  );
}
