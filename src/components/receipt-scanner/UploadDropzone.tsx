import type { RefObject } from 'react';

interface UploadDropzoneProps {
  handleDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
}

export function UploadDropzone({ handleDrop, fileInputRef }: UploadDropzoneProps) {
  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-brand-secondary hover:bg-brand-bg/30 transition-colors cursor-pointer"
      onDrop={handleDrop}
      onDragOver={(event) => event.preventDefault()}
      onClick={() => fileInputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          fileInputRef.current?.click();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Upload a receipt image. Click or drag and drop."
    >
      <span className="text-3xl block mb-2" aria-hidden="true">
        📤
      </span>
      <p className="text-sm text-text-secondary mb-1">Drop your receipt here or click to upload</p>
      <p className="text-xs text-text-muted">JPG, PNG, or WebP — max 5MB</p>
    </div>
  );
}
