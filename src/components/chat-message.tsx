import React, { useState, useEffect } from "react";
import { User, Volume2, VolumeX } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn, formatTime, formatFileSize } from "@/lib/utils";
import type { ChatMessageProps } from "@/lib/types";
import BaymaxLogo from "@/components/llm-logo";
import { useTypewriter } from "@/hooks/use-typewriter";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";

export default function ChatMessage({ message, onTypingComplete }: ChatMessageProps & { onTypingComplete?: () => void }) {
  const isUser = message.role === "user";
  const [isHovered, setIsHovered] = useState(false);
  const { speak, stop, isPlaying, isSupported } = useTextToSpeech();
  
  const { displayedText, isComplete } = useTypewriter(
    isUser ? message.content : message.content,
    isUser ? 0 : 5 
  );

  // Call onTypingComplete when AI message typing animation finishes
  useEffect(() => {
    if (!isUser && isComplete && onTypingComplete) {
      onTypingComplete();
    }
  }, [isComplete, isUser, onTypingComplete]);

  // Use the animated text for AI messages, original text for user messages
  const contentToShow = isUser ? message.content : displayedText;

  const handleTTSClick = () => {
    if (isPlaying) {
      stop();
    } else {
      // Use the full message content for TTS, not just the displayed text
      speak(message.content);
    }
  };

  return (
    <div
      className={cn(
        "flex gap-4 max-w-4xl relative group",
        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
        "flex-1 min-w-0 relative",
        isUser ? "text-right" : "text-left"
      )}>
        {/* Image Preview for user messages */}
        {isUser && message.image && (
          <div className={cn("mb-2", isUser ? "flex justify-end" : "flex justify-start")}>
            <div>
              <img 
                src={message.image.url} 
                alt="Uploaded image"
                className="max-w-xs max-h-48 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
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
              : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-foreground rounded-bl-md"
          )}
        >
          {/* TTS Button for AI messages - positioned right beside the message bubble */}
          {!isUser && isSupported && isHovered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTTSClick}
              className={cn(
                "absolute -right-10 top-2 h-8 w-8 p-0 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 z-10",
                isPlaying ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700" : ""
              )}
              title={isPlaying ? "Stop speaking" : "Read aloud"}
            >
              {isPlaying ? (
                <VolumeX className="h-4 w-4 text-red-600" />
              ) : (
                <Volume2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              )}
            </Button>
          )}

          {/* Message tail */}
          <div
            className={cn(
              "absolute w-3 h-3 rotate-45",
              isUser
                ? "bg-red-600 -bottom-1 right-2"
                : "bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 -bottom-1 left-2"
            )}
          />
          
          <div className={cn(
            "prose prose-sm max-w-none",
            isUser 
              ? "prose-invert" 
              : "prose-slate prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-code:text-foreground prose-blockquote:text-muted-foreground"
          )}>
            {message.role === "assistant" ? (
              <div className="relative">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="mb-2 last:mb-0 ml-4">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-2 last:mb-0 ml-4">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    code: ({ children }) => (
                      <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800 dark:text-gray-200">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg overflow-x-auto">
                        {children}
                      </pre>
                    ),
                  }}
                >
                  {contentToShow}
                </ReactMarkdown>
                {/* Blinking cursor while typing */}
                {!isComplete && !isUser && (
                  <span className="inline-block w-2 h-4 bg-gray-400 ml-1 animate-pulse" />
                )}
              </div>
            ) : (
              <p className="mb-0 break-words">{contentToShow}</p>
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