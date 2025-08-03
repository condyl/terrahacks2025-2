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
  const [hasStarted, setHasStarted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Don't show welcome message immediately - only after first interaction
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

    // Set hasStarted to true on first submit to trigger layout change
    if (!hasStarted) {
      setIsTransitioning(true);
      
      // Add welcome message first, then user message
      const welcomeMessage: Message = {
        id: generateId(),
        role: "assistant",
        content:
          "Hello! I am Baymax Lite, your personal healthcare companion. 🤖\n\nI was created to help with your healthcare needs. I will scan you now... *scanning complete* ✅\n\nHow can I assist with your health and wellness today? Please remember that I am not a substitute for professional medical care.",
        timestamp: new Date(),
      };

      // Set both messages at once to avoid race conditions
      setMessages([welcomeMessage, userMessage]);

      // Start transition, then change layout after a brief delay
      setTimeout(() => {
        setHasStarted(true);
        
        // End transition after layout change
        setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
      }, 200);
    } else {
      // For subsequent messages, just add the user message
      setMessages((prev) => [...prev, userMessage]);
    }

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

  // Initial centered layout
  if (!hasStarted) {
    return (
      <div
        className={`min-h-screen flex flex-col bg-gray-50 transition-all duration-500 ease-in-out ${
          isTransitioning ? "opacity-90 scale-98" : "opacity-100 scale-100"
        }`}
      >
        {/* Animated header that slides in from top during transition */}
        <div
          className={`transform transition-all duration-700 ease-in-out ${
            isTransitioning
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0 absolute"
          }`}
        >
          <div className="py-4 px-4 lg:px-6 bg-white border-b border-gray-200">
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
        </div>

        {/* Centered Input Area */}
        <div
          className={`flex-1 flex items-center justify-center px-4 transition-all duration-500 ease-in-out ${
            isTransitioning ? "translate-y-8 opacity-80" : "translate-y-0 opacity-100"
          }`}
        >
          <div className="w-full max-w-2xl">
            {/* Large centered logo and title */}
            <div
              className={`text-center mb-8 transition-all duration-500 ease-in-out ${
                isTransitioning ? "scale-75 opacity-60" : "scale-100 opacity-100"
              }`}
            >
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="scale-150">
                  <BaymaxLogo />
                </div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                  Baymax Lite
                </h1>
              </div>
              <p className="text-lg text-muted-foreground mb-2">
                Your Personal Healthcare Companion
              </p>
              <p className="text-sm text-red-600 font-medium">
                "I am satisfied with my care"
              </p>
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

            {/* Centered Input Form */}
            <div className="bg-white rounded-2xl border border-gray-200 p-1">
              <ChatForm
                input={input}
                onInputChange={setInput}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </div>

            {/* Helpful suggestions */}
            <div
              className={`mt-6 text-center text-sm text-muted-foreground transition-all duration-500 ease-in-out ${
                isTransitioning ? "opacity-40" : "opacity-100"
              }`}
            >
              <p>
                Try asking about symptoms, health tips, or general wellness
                questions
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular chat layout after first message
  return (
    <div
      className={`min-h-screen flex flex-col transition-all duration-500 ease-in-out ${
        isTransitioning ? "opacity-90" : "opacity-100"
      }`}
    >
      {/* Header - Slides in from top */}
      <div
        className={`sticky top-0 z-50 flex-shrink-0 py-2 px-4 lg:px-6 bg-white border-b border-gray-200 transform transition-all duration-700 ease-in-out ${
          isTransitioning ? "translate-y-0 opacity-100" : "translate-y-0 opacity-100"
        }`}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-2">
            <div className="scale-75">
              <BaymaxLogo />
            </div>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
              Baymax Lite
            </CardTitle>
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

      {/* Chat Container - Fades in */}
      <div
        className={`flex-1 bg-gray-50 transition-all duration-500 ease-in-out delay-200 ${
          isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        }`}
      >
        {/* Single scrollable area containing both messages and input */}
        <ScrollArea className="h-[calc(100vh-60px)]">
          <div className="max-w-5xl mx-auto">
            {/* Messages Area */}
            <div className="p-6 space-y-6 min-h-[calc(100vh-200px)]">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && <LoadingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form - Now inside scrollable area */}
            <div className="p-4 bg-transparent">
              <ChatForm
                input={input}
                onInputChange={setInput}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}