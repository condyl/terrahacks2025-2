"use client";

import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { FaUser, FaRobot } from "react-icons/fa";

import { useEnterSubmit } from "@/hooks/use-enter-submit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import LlmLogo from "@/components/llm-logo";

export default function Chat() {
  const [messages, setMessages] = useState<
    { id: string; role: "user" | "assistant"; content: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { formRef, onKeyDown } = useEnterSubmit();

  useEffect(() => {
    setMessages([
      {
        id: nanoid(),
        role: "assistant",
        content:
          "Welcome to the Healthcare Chat! How can I help you today? Please remember, I am an AI assistant and not a medical professional.",
      },
    ]);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input) return;

    const userMessage = { id: nanoid(), role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const { response: assistantResponse } = await response.json();

      const assistantMessage = {
        id: nanoid(),
        role: "assistant" as const,
        content: assistantResponse,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage = {
        id: nanoid(),
        role: "assistant" as const,
        content: "Sorry, something went wrong. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Card className="w-[800px] h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-center">
          <LlmLogo />
          <CardTitle className="text-2xl font-bold text-center text-blue-600 ml-2">
            Healthcare Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col flex-grow">
          <ScrollArea className="flex-grow p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-4 ${
                    message.role === "user" ? "justify-end" : ""
                  }`}
                >
                  {message.role === "assistant" && (
                    <Avatar>
                      <AvatarFallback>
                        <FaRobot />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-lg p-3 max-w-[70%] ${
                      message.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-blue-100 text-black"
                    }`}
                  >
                    {message.content}
                  </div>
                  {message.role === "user" && (
                    <Avatar>
                      <AvatarFallback>
                        <FaUser />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>
                      <FaRobot />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg p-3 max-w-[70%] bg-blue-100 text-black">
                    Thinking...
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="flex items-center p-4 border-t"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask a healthcare question..."
              className="flex-grow resize-none"
              rows={1}
              disabled={isLoading}
            />
            <Button type="submit" className="ml-4" disabled={isLoading}>
              Send
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}