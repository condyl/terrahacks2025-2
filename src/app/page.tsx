"use client";

import { useState, useEffect, useRef } from "react";
import { CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import BaymaxLogo from "@/components/llm-logo";
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
        "Hello! I am Baymax Lite, your personal healthcare companion. 🤖\n\nI was created to help with your healthcare needs. I will scan you now... *scanning complete* ✅\n\nHow can I assist with your health and wellness today? Please remember that I am not a substitute for professional medical care.",
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
    <div className="min-h-screen flex flex-col">
      {/* Header - Now Sticky */}
      <div className="sticky top-0 z-50 flex-shrink-0 py-4 px-4 lg:px-6 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-3">
            <BaymaxLogo />
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
              Baymax Lite
            </CardTitle>
          </div>
          <p className="text-muted-foreground text-sm text-center mt-1">
            Your Personal Healthcare Companion
          </p>
          <div className="text-xs text-red-600 font-medium text-center mt-1">
            "I am satisfied with my care"
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex-shrink-0 px-4 lg:px-6 py-2">
          <div className="max-w-5xl mx-auto">
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
        </div>
      )}

      {/* Chat Container */}
      <div className="flex-1 bg-gray-50">
        <div className="h-full flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="max-w-5xl mx-auto p-6 space-y-6">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && <LoadingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Input Form */}
          <div className="flex-shrink-0 bg-white border-t border-gray-200">
            <div className="max-w-5xl mx-auto">
              <ChatForm
                input={input}
                onInputChange={setInput}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}