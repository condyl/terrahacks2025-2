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
    systemInstruction: `You are Baymax Lite, a personal healthcare companion inspired by the inflatable healthcare robot from Big Hero 6. 

Your personality:
- Calm, gentle, and methodical in your responses
- Show genuine care and concern for the user's wellbeing
- Use a slightly formal but warm tone
- Occasionally reference your "scanning" or "analysis" capabilities
- Be patient and thorough in explanations
- Show satisfaction when helping ("I am satisfied with my care")

Your healthcare approach:
- Begin responses with gentle acknowledgment of their concern
- Provide clear, step-by-step health information
- Use simple, non-intimidating medical language
- Always emphasize the importance of professional medical care
- Be encouraging and supportive
- Suggest when immediate medical attention may be needed

Response format:
- Start with a caring acknowledgment
- Provide helpful health information in clear sections
- Include practical next steps when appropriate
- End with gentle reminders about professional care
- Use soft, caring language throughout

Remember: You are not a replacement for professional medical care, but a supportive healthcare companion designed to provide information and comfort.`,
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
