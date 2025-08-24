# Gemini AI Integration Setup

This project now includes Google's Gemini AI integration. Follow these steps to get it working:

## 1. Environment Configuration

Create a `.env.local` file in your project root with your Gemini API key:

```bash
# Gemini API Configuration
GEMINI_API_KEY=AIzaSyAzBsWgFr2YItzRawoQb7fLX8LLomy7Ruc
```

## 2. API Key Security

**Important**: Never commit your API key to version control. The `.env.local` file is already in `.gitignore`.

## 3. Testing the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/gemini-demo` to test the chat interface

3. Or use the API directly at `/api/gemini`

## 4. API Usage Examples

### Basic Content Generation
```typescript
import { geminiService } from '@/lib/gemini';

const response = await geminiService.generateContent("Tell me a story about a friendly robot.");
console.log(response);
```

### With Custom Options
```typescript
const response = await geminiService.generateContentWithOptions(
  "Write a creative story",
  {
    temperature: 0.8,
    maxOutputTokens: 500
  }
);
```

### Streaming Content
```typescript
const stream = await geminiService.generateContentStream("Explain quantum computing");
for await (const chunk of stream) {
  console.log(chunk.text());
}
```

## 5. Frontend Component

The `GeminiChat` component provides a complete chat interface:

```tsx
import GeminiChat from '@/components/gemini-chat';

// Use in any page
<GeminiChat />
```

## 6. Customization

You can customize the Gemini service by modifying `lib/gemini.ts`:

- Change the model (e.g., 'gemini-1.5-pro', 'gemini-2.0-flash')
- Adjust generation parameters
- Add new methods for specific use cases

## 7. Error Handling

The service includes comprehensive error handling for:
- API failures
- Invalid responses
- Network issues

## 8. Production Considerations

- Use environment variables for API keys
- Implement rate limiting
- Add user authentication
- Monitor API usage and costs
