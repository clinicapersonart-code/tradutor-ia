import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Initialize Gemini
// NOTE: Process.env.API_KEY is automatically injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Converts a File object to a Base64 string suitable for the Gemini API.
 */
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Transcribes audio file using Gemini 2.5 Flash with streaming response.
 * Handles long audio context.
 */
export const transcribeAudioStream = async (
  file: File,
  onChunk: (text: string) => void
): Promise<void> => {
  try {
    const audioPart = await fileToGenerativePart(file);

    // Prompt engineering for timestamps and formatting
    const prompt = `
      Você é um transcritor de áudio profissional especializado em Português Brasileiro.
      
      Sua tarefa é transcrever o arquivo de áudio fornecido com alta precisão.
      
      Regras de Formatação:
      1. Adicione marcadores de tempo no formato **[MM:SS]** no início de cada novo segmento de fala ou parágrafo. Para áudios longos use **[HH:MM:SS]**.
      2. Separe falas de diferentes interlocutores com quebras de linha claras.
      3. Não resuma o áudio. Transcreva palavra por palavra (verbatim limpo), removendo gaguejos excessivos, mas mantendo o conteúdo integral.
      4. O idioma de saída deve ser estritamente Português.
      
      Exemplo de Saída:
      [00:00] Olá, bem-vindos ao nosso podcast.
      [00:05] Hoje vamos discutir inteligência artificial.
    `;

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash', // Best model for speed and multimodal context window
      contents: {
        parts: [
            audioPart,
            { text: prompt }
        ]
      },
      config: {
        temperature: 0.3, // Low temperature for more factual accuracy
      }
    });

    for await (const chunk of responseStream) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        onChunk(c.text);
      }
    }

  } catch (error) {
    console.error("Erro na transcrição:", error);
    throw error;
  }
};