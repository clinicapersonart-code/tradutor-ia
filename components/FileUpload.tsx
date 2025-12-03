import React, { useCallback, useState } from 'react';
import { Upload, FileAudio, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateAndSelect = (file: File) => {
    // Validar tipo
    if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
      setError('Por favor, envie apenas arquivos de áudio (MP3, WAV, M4A) ou vídeo.');
      return;
    }
    
    // Warning para arquivos muito grandes (Base64 limit)
    // Embora Gemini aguente muito, o browser pode travar ao converter > 50MB em Base64 string.
    if (file.size > 50 * 1024 * 1024) {
      setError('Aviso: Arquivos acima de 50MB podem causar lentidão no navegador. Recomendamos comprimir o áudio.');
      // We still allow it, just warn.
    } else {
        setError(null);
    }

    onFileSelect(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSelect(files[0]);
    }
  }, [onFileSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSelect(files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ease-in-out
          ${isDragging 
            ? 'border-blue-500 bg-blue-500/10 scale-[1.02]' 
            : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
          }
        `}
      >
        <input
          type="file"
          accept="audio/*,video/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
          <div className={`p-4 rounded-full ${isDragging ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700/50 text-slate-400'}`}>
            {isDragging ? <Upload size={32} /> : <FileAudio size={32} />}
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-200">
              {isDragging ? 'Solte o arquivo aqui' : 'Clique ou arraste o áudio'}
            </h3>
            <p className="text-sm text-slate-400">
              Suporta MP3, WAV, AAC, M4A (Até 1 hora de duração recomendada)
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-900/30 border border-red-800/50 rounded-lg flex items-center gap-2 text-red-300 text-sm animate-fade-in">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
};