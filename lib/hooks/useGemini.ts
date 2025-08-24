import { useState, useCallback } from 'react';

interface UseGeminiOptions {
  onSuccess?: (response: string) => void;
  onError?: (error: string) => void;
}

interface UseGeminiReturn {
  generateContent: (prompt: string, options?: any) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  response: string | null;
  reset: () => void;
}

export function useGemini(options: UseGeminiOptions = {}): UseGeminiReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);

  const generateContent = useCallback(async (prompt: string, generationOptions?: any) => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const apiResponse = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt,
          options: generationOptions 
        }),
      });

      if (!apiResponse.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await apiResponse.json();
      setResponse(data.response);
      options.onSuccess?.(data.response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      options.onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setError(null);
    setResponse(null);
  }, []);

  return {
    generateContent,
    isLoading,
    error,
    response,
    reset,
  };
}
