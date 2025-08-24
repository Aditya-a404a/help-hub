import { NextRequest, NextResponse } from 'next/server';
import { geminiService } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { prompt, options, mcpContext, useRescueStrategy } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    let response: string;

    if (useRescueStrategy && mcpContext) {
      // Use the specialized rescue strategy generation with MCP tools
      response = await geminiService.generateRescueStrategy(
        mcpContext.incident,
        mcpContext.teams,
        mcpContext.resources,
        mcpContext.communications
      );
    } else if (options) {
      response = await geminiService.generateContentWithOptions(prompt, options, mcpContext);
    } else {
      response = await geminiService.generateContent(prompt, mcpContext);
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Gemini API is running' });
}
