import GeminiChat from '@/components/gemini-chat';
import GeminiExample from '@/components/gemini-example';

export default function GeminiDemoPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Gemini AI Integration Demo</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Experience Google&apos;s Gemini AI in your Next.js application
        </p>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Simple Content Generation</h2>
          <GeminiExample />
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4">Interactive Chat</h2>
          <GeminiChat />
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Powered by Google Gemini 2.0 Flash</p>
      </div>
    </div>
  );
}
