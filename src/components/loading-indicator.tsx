import React from "react";
import { formatTime } from "@/lib/utils";
import BaymaxLogo from "@/components/llm-logo";

export default function LoadingIndicator() {
  return (
    <div className="flex gap-4 max-w-4xl mr-auto">
      {/* Avatar */}
      <div className="size-10 shrink-0">
        <BaymaxLogo />
      </div>

      {/* Loading Message */}
      <div className="flex-1 min-w-0">
        <div className="inline-block px-4 py-3 rounded-2xl rounded-bl-md shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-foreground relative max-w-[85%]">
          {/* Message tail */}
          <div className="absolute w-3 h-3 rotate-45 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 -bottom-1 left-2" />

          <div
            className="flex items-center gap-3"
            role="status"
            aria-label="Baymax is analyzing your healthcare needs"
          >
            <span className="text-sm text-muted-foreground">
              Baymax is analyzing your healthcare needs
            </span>
            <div className="flex gap-1" aria-hidden="true">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
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