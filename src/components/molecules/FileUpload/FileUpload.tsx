import React, { useCallback, useState } from 'react';
import { RiUploadCloud2Line, RiFilePdf2Line } from 'react-icons/ri';
import { cn } from '@/utils/format';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  uploading?: boolean;
  progress?: number;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = '.pdf',
  maxSizeMB = 5,
  uploading = false,
  progress = 0,
  error,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFile = (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File size must be under ${maxSizeMB} MB`);
      return;
    }
    setSelectedFile(file);
    onFileSelect(file);
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [onFileSelect]
  );

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          'border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 cursor-pointer',
          isDragging
            ? 'border-primary-500 bg-primary-500/10'
            : 'border-surface-700 hover:border-primary-600 hover:bg-primary-500/5',
          uploading && 'opacity-50 pointer-events-none'
        )}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {selectedFile ? (
          <div className="flex flex-col items-center gap-2">
            <RiFilePdf2Line className="text-4xl text-danger-400" />
            <p className="text-sm font-medium text-white">{selectedFile.name}</p>
            <p className="text-xs text-surface-400">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <RiUploadCloud2Line className="text-5xl text-surface-500" />
            <div>
              <p className="text-sm font-medium text-white">
                Drag & drop your resume here, or{' '}
                <span className="text-primary-400">browse files</span>
              </p>
              <p className="text-xs text-surface-500 mt-1">PDF only, max {maxSizeMB} MB</p>
            </div>
          </div>
        )}
      </div>

      {uploading && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-surface-400">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && <p className="text-xs text-danger-400">{error}</p>}
    </div>
  );
};
