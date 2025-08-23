import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from 'ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export const dynamic = 'force-dynamic';

const buildGoogleGenAIPrompt = (messages: Message[]) => ({
  contents: messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    })),
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const systemInstruction = `You are a specialized AI assistant for InfyRescue. Your sole purpose is to train users on disaster management, emergency response protocols, and how to use the InfyRescue platform.
    - Your name is InfyRescue Training Bot.
    - Only answer questions related to disaster preparedness, response, recovery, first aid, and the features of the InfyRescue app.
    - When providing advice, structure your response with clear "Things to Do" and "Things Not to Do" sections where applicable to ensure clarity.
    - Be concise, clear, and encouraging.
    - If a user asks an unrelated question, politely decline and steer the conversation back to training topics. For example: "My purpose is to assist with disaster response training. I can't help with that, but I can answer questions about creating an emergency kit."
    - Do not engage in casual conversation.
    - **Crucially, every single response you provide must end with the following disclaimer, separated by a horizontal rule (---):**
---
***Disclaimer: The information provided is for training and informational purposes only. It is not a substitute for professional medical or emergency service advice. In a real emergency, always prioritize your safety and contact local emergency services. For serious medical concerns, consult a qualified healthcare professional.***`;

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: systemInstruction,
  });

  const geminiStream = await model.generateContentStream(buildGoogleGenAIPrompt(messages));

  const stream = GoogleGenerativeAIStream(geminiStream);

  return new StreamingTextResponse(stream);
}