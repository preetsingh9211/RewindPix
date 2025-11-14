import React, { useState, useRef, ChangeEvent } from 'react';

interface ImageUploaderProps {
  id: string;
  label: string;
  onImageUpload: (file: File) => void;
}

const UploadIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

export const ImageUploader: React.FC<ImageUploaderProps> = ({ id, label, onImageUpload }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        setFileName(file.name);
        onImageUpload(file);
      } else {
        alert('Please select a valid image file.');
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg flex flex-col items-center h-full">
      <h3 className="text-xl font-semibold text-slate-300 mb-4">{label}</h3>
      <div
        className="w-full h-64 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-teal-500 hover:bg-slate-700/50 transition-all duration-300 relative overflow-hidden"
        onClick={handleClick}
        onDrop={(e) => { e.preventDefault(); handleFileChange({ target: { files: e.dataTransfer.files } } as any); }}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          type="file"
          id={id}
          ref={fileInputRef}
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
        />
        {imagePreview ? (
          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center">
            <UploadIcon />
            <p className="text-slate-400">
              <span className="font-semibold text-teal-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-slate-400 mt-1">PNG, JPG, or WEBP</p>
          </div>
        )}
      </div>
       {fileName && <p className="text-sm text-slate-400 mt-3 truncate w-full text-center">{fileName}</p>}
    </div>
  );
};