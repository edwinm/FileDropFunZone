"use client";

import type { UploadedFile } from '@/types';
import { FileItem } from './file-item';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FileListProps {
  files: UploadedFile[];
}

export function FileList({ files }: FileListProps) {
  if (files.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground italic">
        <p>No files uploaded yet. Drag and drop files above or click to browse.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-300px)] md:h-[calc(100vh-350px)] rounded-md border p-1 sm:p-2 bg-muted/20 shadow-inner">
      <div className="space-y-3 p-2 sm:p-3">
        {files.map((file) => (
          <FileItem key={file.id} item={file} />
        ))}
      </div>
    </ScrollArea>
  );
}
