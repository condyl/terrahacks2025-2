import React from "react";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, formatTime } from "@/lib/utils";
import type { ChatMessageProps } from "@/lib/types";

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
      <Avatar className={cn(
        "size-10 shrink-0 ring-2 ring-offset-2",
        isUser 
          ? "ring-blue-200 ring-offset-blue-50" 
          : "ring-emerald-200 ring-offset-emerald-50"
      )}>
        <AvatarFallback className={cn(
          "text-white font-medium",
          isUser 
            ? "bg-gradient-to-br from-blue-500 to-blue-600" 
            : "bg-gradient-to-br from-emerald-500 to-emerald-600"
        )}>
          {isUser ? <User className="size-5" /> : <Bot className="size-5" />}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className={cn(
        "flex-1 min-w-0",
        isUser ? "text-right" : "text-left"
      )}>
        {/* Message Bubble */}
        <div
          className={cn(
            "inline-block px-4 py-3 rounded-2xl shadow-sm max-w-[85%] relative",
            isUser
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
              : "bg-white border border-border/50 text-foreground rounded-bl-md"
          )}
        >
          {/* Message tail */}
          <div
            className={cn(
              "absolute w-3 h-3 rotate-45",
              isUser
                ? "bg-blue-600 -bottom-1 right-2"
                : "bg-white border-r border-b border-border/50 -bottom-1 left-2"
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
                    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-muted p-3 rounded-lg overflow-x-auto">
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