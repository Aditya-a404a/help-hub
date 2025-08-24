import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export class GeminiService {
  private model: any;

  constructor() {
    // Use Gemini 2.0 Flash model
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  /**
   * Generate content using Gemini
   * @param prompt - The prompt to send to Gemini
   * @returns Generated text response
   */
  async generateContent(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating content with Gemini:', error);
      throw new Error('Failed to generate content with Gemini');
    }
  }

  /**
   * Generate content with streaming for real-time responses
   * @param prompt - The prompt to send to Gemini
   * @returns Stream of generated content
   */
  async generateContentStream(prompt: string) {
    try {
      const result = await this.model.generateContentStream(prompt);
      return result.stream;
    } catch (error) {
      console.error('Error generating streaming content with Gemini:', error);
      throw new Error('Failed to generate streaming content with Gemini');
    }
  }

  /**
   * Generate content with specific parameters
   * @param prompt - The prompt to send to Gemini
   * @param options - Generation options
   * @returns Generated text response
   */
  async generateContentWithOptions(
    prompt: string,
    options: {
      temperature?: number;
      topK?: number;
      topP?: number;
      maxOutputTokens?: number;
    }
  ): Promise<string> {
    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: options,
      });
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating content with options:', error);
      throw new Error('Failed to generate content with Gemini');
    }
  }
}

// Export a singleton instance
export const geminiService = new GeminiService();
