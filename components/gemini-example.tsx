'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGemini } from '@/lib/hooks/useGemini';
import { Loader2, Sparkles } from 'lucide-react';

export default function GeminiExample() {
  const [prompt, setPrompt] = useState('');
  const { generateContent, isLoading, error, response, reset } = useGemini({
    onSuccess: (response) => {
      console.log('Generated content:', response);
    },
    onError: (error) => {
      console.error('Gemini error:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      generateContent(prompt);
    }
  };

  const handleClear = () => {
    setPrompt('');
    reset();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Gemini Content Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium mb-2">
              Enter your prompt:
            </label>
            <Input
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Write a short story about a robot..."
              disabled={isLoading}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={isLoading || !prompt.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Content
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClear}
              disabled={isLoading}
            >
              Clear
            </Button>
          </div>
        </form>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">
              Error: {error}
            </p>
          </div>
        )}

        {response && (
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300">
              Generated Content:
            </h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 border rounded-lg">
              <p className="whitespace-pre-wrap text-sm">{response}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
