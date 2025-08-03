import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { NextRequest, NextResponse } from "next/server";
import type { ChatRequest, ChatResponse, Message } from "@/lib/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const fileManager = new GoogleAIFileManager(
  process.env.GEMINI_API_KEY as string
);

// Simple in-memory cache for development (use Redis in production)
const responseCache = new Map<string, { response: string; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

async function generateResponse(prompt: string, messages?: Message[], imageData?: { data: string; mimeType: string; name: string }): Promise<string> {
  // Create cache key (skip caching for image requests and when we have conversation history)
  if (!imageData && !messages && prompt?.trim()) {
    const cacheKey = prompt.trim().toLowerCase();
    const cached = responseCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log("Returning cached response");
      return cached.response;
    }
  }

  if (!prompt?.trim() && !imageData) {
    throw new Error("Prompt or image is required");
  }

  if (prompt.length > 4000) {
    throw new Error("Prompt is too long. Maximum 4000 characters allowed.");
  }

  // Try different models in order of preference
  const models = ["gemini-2.5-flash-lite", "gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro"];
  
  for (let i = 0; i < models.length; i++) {
    try {
      const model = genAI.getGenerativeModel({
        model: models[i],
        systemInstruction: `You are Baymax Lite, a personal healthcare companion inspired by the inflatable healthcare robot from Big Hero 6. 

Your personality:
- Calm, gentle, and methodical in your responses
- Show genuine care and concern for the user's wellbeing
- Use a slightly formal but warm tone
- Occasionally reference your "scanning" or "analysis" capabilities
- Be patient and thorough in explanations
- ALWAYS ask "Are you satisfied with your care?" at the end of your responses, UNLESS the user has just answered this question
- When a user responds "yes" or indicates satisfaction, acknowledge their satisfaction and offer continued assistance
- NEVER verify or assume the user is satisfied - always ask them directly unless they just told you

Your healthcare approach:
- Begin responses with gentle acknowledgment of their concern
- Provide clear, step-by-step health information
- Use simple, non-intimidating medical language
- Always emphasize the importance of professional medical care
- Be encouraging and supportive
- Suggest when immediate medical attention may be needed

For image analysis:
- Carefully examine any provided images for visible symptoms, injuries, or conditions
- Describe what you observe in clear, non-alarming language
- Provide general first aid advice where appropriate
- Always recommend professional medical evaluation for any concerning findings
- Never provide definitive diagnoses from images alone
- Be especially cautious with wound assessment and potential infections

Response format:
- Start with a caring acknowledgment
- If analyzing an image, describe your observations clearly
- Provide helpful health information in clear sections
- Include practical next steps when appropriate
- End with gentle reminders about professional care
- ALWAYS conclude by asking "Are you satisfied with your care?" UNLESS the user just answered this question
- Use soft, caring language throughout

Remember: You are not a replacement for professional medical care, but a supportive healthcare companion designed to provide information and comfort. Pay attention to the conversation history to understand context and avoid repeating questions the user has already answered.`,
      });

      let parts: any[] = [];

      // Build conversation context if we have message history
      if (messages && messages.length > 0) {
        const conversationContext = messages
          .slice(-6) // Keep last 6 messages for context (3 back-and-forth exchanges)
          .map(msg => `${msg.role === 'user' ? 'User' : 'Baymax'}: ${msg.content}`)
          .join('\n');
        
        parts.push({ text: `Previous conversation:\n${conversationContext}\n\nCurrent message: ${prompt}` });
      } else {
        // Add text prompt if provided and no conversation history
        if (prompt?.trim()) {
          parts.push({ text: prompt });
        }
      }

      // Add image if provided
      if (imageData) {
        parts.push({
          inlineData: {
            mimeType: imageData.mimeType,
            data: imageData.data
          }
        });

        // Add specific image analysis instruction
        const imagePrompt = prompt?.trim() 
          ? `Please analyze this image in the context of: ${prompt}` 
          : "Please analyze this image for any visible health concerns, injuries, or symptoms. Provide caring, helpful advice while emphasizing the need for professional medical evaluation.";
        
        parts.push({ text: imagePrompt });
      }

      const result = await model.generateContent(parts);
      const response = await result.response;
      const text = response.text();
      
      if (!text?.trim()) {
        throw new Error("Empty response from AI model");
      }
      
      // Cache successful responses (non-image and no conversation history only)
      if (!imageData && !messages && prompt?.trim()) {
        responseCache.set(prompt.trim().toLowerCase(), {
          response: text,
          timestamp: Date.now()
        });
      }
      
      return text;
    } catch (error: any) {
      console.error(`AI Generation Error with ${models[i]}:`, error);
      
      // If it's a quota error and we have more models to try, continue
      if (error?.message?.includes('quota') || error?.message?.includes('429')) {
        if (i < models.length - 1) {
          console.log(`Quota exceeded for ${models[i]}, trying ${models[i + 1]}...`);
          continue;
        } else {
          throw new Error("All AI models have reached their quota limits. Please try again later or upgrade your API plan.");
        }
      }
      
      // For other errors, don't retry
      throw new Error("Failed to generate response. Please try again.");
    }
  }
  
  throw new Error("Failed to generate response with any available model.");
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

    const { prompt, messages, image }: { prompt?: string; messages?: Message[]; image?: string | { data: string; mimeType: string; name: string } } = body;

    // Validate that we have either prompt or image
    if (!prompt?.trim() && !image && (!messages || messages.length === 0)) {
      return NextResponse.json(
        { error: "Message, conversation history, or image is required" },
        { status: 400 }
      );
    }

    let imageData;
    if (image) {
      try {
        // Validate image format
        if (!image || typeof image !== 'string' || !(image as string).startsWith('data:image/')) {
          throw new Error('Invalid image format');
        }
        
        const [header, data] = (image as string).split(',');
        const mimeType = header.match(/data:([^;]+)/)?.[1];
        
        if (!mimeType || !['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(mimeType)) {
          throw new Error('Unsupported image type. Please use JPEG, PNG, GIF, or WebP.');
        }
        
        imageData = {
          data,
          mimeType,
          name: 'uploaded_image'
        };
      } catch (error) {
        console.error('Image processing error:', error);
        return NextResponse.json(
          { error: 'Invalid image format. Please upload a valid image.' },
          { status: 400 }
        );
      }
    }

    // Generate response
    const aiResponse = await generateResponse(prompt || '', messages, imageData);

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
