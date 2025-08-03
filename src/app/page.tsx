"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import LlmLogo from "@/components/llm-logo";
import ChatMessage from "@/components/chat-message";
import ChatForm from "@/components/chat-form";
import LoadingIndicator from "@/components/loading-indicator";
import {
  generateId,
  handleApiError,
  sanitizeInput,
  isValidMessage,
} from "@/lib/utils";
import type { Message, ChatResponse, ApiResponse } from "@/lib/types";

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const welcomeMessage: Message = {
      id: generateId(),
      role: "assistant",
      content:
        "👋 Welcome to HealthAI Chat! I'm your AI healthcare assistant. I can help answer health questions and provide medical information.\n\n**Important:** I'm not a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for medical concerns.",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const sanitizedInput = sanitizeInput(input);
    if (!isValidMessage(sanitizedInput)) {
      setError("Please enter a valid message (1-4000 characters)");
      return;
    }

    // Clear any existing errors
    setError(null);

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: sanitizedInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ prompt: sanitizedInput }),
      });

      if (!response.ok) {
        const errorData: ApiResponse = await response.json();
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data: ChatResponse = await response.json();

      if (!data.response) {
        throw new Error("Invalid response format from server");
      }

      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const chatError = handleApiError(error);

      const errorMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: `I apologize, but I encountered an error: ${chatError.message}\n\nPlease try again in a moment.`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
      setError(chatError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-6">
      <div className="w-full max-w-5xl h-[95vh] flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-md">
            <CardHeader className="text-center py-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <LlmLogo />
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  HealthAI Chat
                </CardTitle>
              </div>
              <p className="text-muted-foreground text-sm">
                Your AI-powered healthcare assistant
              </p>
            </CardHeader>
          </Card>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4">
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <button
                  onClick={clearError}
                  className="text-red-600 hover:text-red-800 font-medium"
                  aria-label="Dismiss error"
                >
                  ✕
                </button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Chat Container */}
        <Card className="flex-1 border-none shadow-xl bg-white/90 backdrop-blur-md overflow-hidden">
          <CardContent className="p-0 h-full flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6 space-y-6">
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  {isLoading && <LoadingIndicator />}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Input Form */}
            <div className="border-t border-border/50 bg-muted/30">
              <ChatForm
                input={input}
                onInputChange={setInput}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}