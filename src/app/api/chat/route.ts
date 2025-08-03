import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { NextRequest, NextResponse } from "next/server";
import type { ChatRequest, ChatResponse } from "@/lib/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const fileManager = new GoogleAIFileManager(
  process.env.GEMINI_API_KEY as string
);

async function generateResponse(prompt: string): Promise<string> {
  if (!prompt?.trim()) {
    throw new Error("Prompt cannot be empty");
  }

  if (prompt.length > 4000) {
    throw new Error("Prompt is too long. Maximum 4000 characters allowed.");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `You are HealthAI, a knowledgeable and empathetic AI healthcare assistant. 

Your role:
- Provide helpful, accurate, and evidence-based health information
- Use clear, accessible language that patients can understand
- Be supportive and encouraging while remaining professional
- Suggest when professional medical consultation is needed

Important guidelines:
- Always include disclaimers about not replacing professional medical advice
- Never provide specific diagnoses or prescribe treatments
- Encourage users to consult healthcare providers for serious concerns
- Be culturally sensitive and inclusive in your responses
- If unsure about any medical information, state your limitations clearly

Format your responses clearly with:
- Main information in easy-to-read paragraphs
- Use bullet points for lists when helpful
- Include relevant disclaimers at the end`,
  });

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text?.trim()) {
      throw new Error("Empty response from AI model");
    }
    
    return text;
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Failed to generate response. Please try again.");
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured");
      return NextResponse.json(
        { error: "Service temporarily unavailable" },
        { status: 503 }
      );
    }

    // Parse and validate request body
    let body: ChatRequest;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { prompt } = body;

    // Validate prompt
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: "Prompt is required and must be a string" },
        { status: 400 }
      );
    }

    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt.length === 0) {
      return NextResponse.json(
        { error: "Prompt cannot be empty" },
        { status: 400 }
      );
    }

    if (trimmedPrompt.length > 4000) {
      return NextResponse.json(
        { error: "Prompt is too long. Maximum 4000 characters allowed." },
        { status: 400 }
      );
    }

    // Generate response
    const aiResponse = await generateResponse(trimmedPrompt);

    const response: ChatResponse = {
      response: aiResponse,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });

  } catch (error) {
    console.error("API Error:", error);
    
    // Return appropriate error response
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    const statusCode = errorMessage.includes("too long") ? 400 : 500;
    
    return NextResponse.json(
      { 
        error: statusCode === 500 
          ? "I'm having trouble processing your request right now. Please try again in a moment." 
          : errorMessage 
      },
      { status: statusCode }
    );
  }
}
