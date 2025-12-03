import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { TranscriptionDisplay } from './components/TranscriptionDisplay';
import { transcribeAudioStream } from './services/gemini';
import { AudioFile } from './types';
import { Mic, X, Play, Pause, Sparkles, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Clean up object URL on unmount or file change
  useEffect(() => {
    return () => {
      if (audioFile) {
        URL.revokeObjectURL(audioFile.previewUrl);
      }
    };
  }, [audioFile]);

  const handleFileSelect = (file: File) => {
    if (audioFile) {
      URL.revokeObjectURL(audioFile.previewUrl);
    }
    setAudioFile({
      file,
      previewUrl: URL.createObjectURL(file),
    });
    setTranscription('');
    setError(null);
  };

  const clearFile = () => {
    if (isTranscribing) return; // Prevent clearing while working
    setAudioFile(null);
    setTranscription('');
    setError(null);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTranscribe = async () => {
    if (!audioFile) return;

    setIsTranscribing(true);
    setTranscription('');
    setError(null);

    try {
      await transcribeAudioStream(audioFile.file, (chunk) => {
        setTranscription((prev) => prev + chunk);
      });
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro desconhecido durante a transcrição.");
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-slate-100 selection:bg-blue-500/30">
      
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Transcreva<span className="text-blue-400">AI</span>
            </h1>
          </div>
          <div className="text-xs text-slate-400 font-medium px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
            Powered by Gemini 2.5 Flash
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-blue-400 to-blue-600">
            Transforme áudio em texto
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Carregue seus arquivos de áudio (podcasts, aulas, reuniões) e obtenha transcrições precisas com marcadores de tempo em segundos.
          </p>
        </div>

        {/* Input Area */}
        {!audioFile ? (
          <FileUpload onFileSelect={handleFileSelect} />
        ) : (
          <div className="w-full max-w-2xl mx-auto bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl animate-fade-in-up">
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="bg-blue-500/10 p-3 rounded-lg">
                  <Mic className="text-blue-400 w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-200 truncate">{audioFile.file.name}</p>
                  <p className="text-xs text-slate-400">{(audioFile.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              
              {!isTranscribing && (
                <button 
                  onClick={clearFile}
                  className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                  title="Remover arquivo"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Audio Player Control */}
            <div className="bg-slate-900/50 rounded-lg p-4 mb-6 flex items-center gap-4">
               <button 
                onClick={togglePlayback}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-500/25"
               >
                 {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
               </button>
               <audio 
                  ref={audioRef} 
                  src={audioFile.previewUrl} 
                  className="hidden" 
                  onEnded={() => setIsPlaying(false)}
               />
               <div className="flex-1">
                 <div className="text-sm text-slate-400 mb-1">Pré-visualização</div>
                 <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                   <div className={`h-full bg-blue-500 animate-pulse w-full origin-left ${isPlaying ? 'opacity-100' : 'opacity-30'}`}></div>
                 </div>
               </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleTranscribe}
              disabled={isTranscribing}
              className={`
                w-full py-4 rounded-xl font-bold text-lg transition-all transform duration-200
                flex items-center justify-center gap-2
                ${isTranscribing 
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5'
                }
              `}
            >
              {isTranscribing ? (
                <>
                  <Sparkles className="animate-spin" />
                  Processando Áudio...
                </>
              ) : (
                <>
                  <Sparkles />
                  Iniciar Transcrição
                </>
              )}
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
            <div className="max-w-2xl mx-auto mt-6 p-4 bg-red-900/20 border border-red-800 rounded-xl flex items-start gap-3 text-red-200">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-semibold">Erro no processamento</h3>
                    <p className="text-sm opacity-80 mt-1">{error}</p>
                </div>
            </div>
        )}

        {/* Output */}
        <TranscriptionDisplay 
            text={transcription} 
            isTranscribing={isTranscribing} 
        />

      </main>
    </div>
  );
};

export default App;