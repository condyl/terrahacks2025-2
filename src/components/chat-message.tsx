import React from "react";
import { User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, formatTime, formatFileSize } from "@/lib/utils";
import type { ChatMessageProps } from "@/lib/types";
import BaymaxLogo from "@/components/llm-logo";

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-4 max-w-4xl",
        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      {/* Avatar */}
      {isUser ? (
        <Avatar className="size-10 shrink-0 ring-2 ring-offset-2 ring-red-200 ring-offset-red-50">
          <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-600 text-white font-medium">
            <User className="size-5" />
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="size-10 shrink-0">
          <BaymaxLogo />
        </div>
      )}

      {/* Message Content */}
      <div className={cn(
        "flex-1 min-w-0",
        isUser ? "text-right" : "text-left"
      )}>
        {/* Image Preview for user messages */}
        {isUser && message.image && (
          <div className={cn("mb-2", isUser ? "flex justify-end" : "flex justify-start")}>
            <div>
              <img 
                src={message.image.url} 
                alt="Uploaded image"
                className="max-w-xs max-h-48 rounded-lg border border-gray-200 shadow-sm"
              />
              <div className={cn("text-xs text-muted-foreground mt-1", isUser ? "text-right" : "text-left")}>
                {message.image.name} ({formatFileSize(message.image.size)})
              </div>
            </div>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            "inline-block px-4 py-3 rounded-2xl shadow-sm max-w-[85%] relative",
            isUser
              ? "bg-gradient-to-r from-red-500 to-red-600 text-white rounded-br-md"
              : "bg-white border border-gray-200 text-foreground rounded-bl-md"
          )}
        >
          {/* Message tail */}
          <div
            className={cn(
              "absolute w-3 h-3 rotate-45",
              isUser
                ? "bg-red-600 -bottom-1 right-2"
                : "bg-white border-r border-b border-gray-200 -bottom-1 left-2"
            )}
          />
          
          <div className={cn(
            "prose prose-sm max-w-none",
            isUser 
              ? "prose-invert" 
              : "prose-slate prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-code:text-foreground prose-blockquote:text-muted-foreground"
          )}>
            {message.role === "assistant" ? (
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="mb-2 last:mb-0 ml-4">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-2 last:mb-0 ml-4">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  code: ({ children }) => (
                    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto">
                      {children}
                    </pre>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            ) : (
              <p className="mb-0 break-words">{message.content}</p>
            )}
          </div>
        </div>

        {/* Timestamp */}
        <div className={cn(
          "text-xs text-muted-foreground mt-1 px-1",
          isUser ? "text-right" : "text-left"
        )}>
          {message.timestamp ? formatTime(message.timestamp) : formatTime(new Date())}
        </div>
      </div>
    </div>
  );
}