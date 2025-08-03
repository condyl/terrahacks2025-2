import React from "react";
import { Bot } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatTime } from "@/lib/utils";

export default function LoadingIndicator() {
  return (
    <div className="flex gap-4 max-w-4xl mr-auto">
      {/* Avatar */}
      <Avatar className="size-10 shrink-0 ring-2 ring-emerald-200 ring-offset-2 ring-offset-emerald-50">
        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-medium">
          <Bot className="size-5" />
        </AvatarFallback>
      </Avatar>

      {/* Loading Message */}
      <div className="flex-1 min-w-0">
        <div className="inline-block px-4 py-3 rounded-2xl rounded-bl-md shadow-sm bg-white border border-border/50 text-foreground relative max-w-[85%]">
          {/* Message tail */}
          <div className="absolute w-3 h-3 rotate-45 bg-white border-r border-b border-border/50 -bottom-1 left-2" />

          <div
            className="flex items-center gap-3"
            role="status"
            aria-label="HealthAI is generating a response"
          >
            <span className="text-sm text-muted-foreground">
              HealthAI is thinking
            </span>
            <div className="flex gap-1" aria-hidden="true">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>

        {/* Timestamp */}
        <div className="text-xs text-muted-foreground mt-1 px-1 text-left">
          {formatTime(new Date())}
        </div>
      </div>
    </div>
  );
}