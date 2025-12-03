import React, { useRef, useEffect } from 'react';
import { Copy, Download, Check, FileText, Clock } from 'lucide-react';

interface TranscriptionDisplayProps {
  text: string;
  isTranscribing: boolean;
}

export const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({ text, isTranscribing }) => {
  const [copied, setCopied] = React.useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom during transcription
  useEffect(() => {
    if (isTranscribing && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [text, isTranscribing]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `transcricao_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!text && !isTranscribing) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/80">
        <div className="flex items-center gap-2 text-slate-200">
          <FileText size={20} className="text-blue-400" />
          <h2 className="font-semibold">Transcrição</h2>
          {isTranscribing && (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 ml-2 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              Gerando...
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            disabled={!text}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50"
          >
            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
          <button
            onClick={handleDownload}
            disabled={!text}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50"
          >
            <Download size={16} />
            Baixar
          </button>
        </div>
      </div>

      <div className="p-6 max-h-[600px] overflow-y-auto whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-300 selection:bg-blue-500/30">
        {text ? (
            text.split('\n').map((line, index) => {
                // Highlight timestamps
                const timeMatch = line.match(/^(\[\d{2}:\d{2}(?::\d{2})?\])(.*)/);
                if (timeMatch) {
                    return (
                        <div key={index} className="mb-3">
                            <span className="text-blue-400 font-bold mr-2 select-none">{timeMatch[1]}</span>
                            <span>{timeMatch[2]}</span>
                        </div>
                    );
                }
                return <div key={index} className="mb-2 min-h-[1.2em]">{line}</div>;
            })
        ) : (
             <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3">
                <Clock className="w-8 h-8 opacity-50" />
                <p>O texto aparecerá aqui em tempo real...</p>
             </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};