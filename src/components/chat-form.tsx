import React from "react";
import { Send, Loader2 } from "lucide-react";
import { useEnterSubmit } from "@/hooks/use-enter-submit";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { isValidMessage } from "@/lib/utils";
import type { ChatFormProps } from "@/lib/types";

export default function ChatForm({ 
  input, 
  onInputChange, 
  onSubmit, 
  isLoading 
}: ChatFormProps) {
  const { formRef, onKeyDown } = useEnterSubmit();
  const isValid = isValidMessage(input);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Don't sanitize on every keystroke - just pass the raw value
    onInputChange(e.target.value);
  };

  return (
    <div className="p-4">
      <form
        ref={formRef}
        onSubmit={onSubmit}
        className="flex items-end gap-3"
      >
        <div className="flex-1 relative">
          <Textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={onKeyDown}
            placeholder="Ask me anything about health and wellness..."
            className="min-h-[52px] max-h-32 resize-none border-2 border-border/50 focus:border-primary/50 rounded-2xl px-4 py-3 pr-12 text-sm transition-colors"
            disabled={isLoading}
            rows={1}
            maxLength={4000}
          />
          <div className="absolute right-3 bottom-3 text-xs text-muted-foreground">
            {input.length > 0 && (
              <span className={input.length > 3800 ? "text-orange-500" : ""}>
                {input.length}/4000
              </span>
            )}
          </div>
          <div className="absolute right-3 top-3 text-xs text-muted-foreground">
            Press Enter to send
          </div>
        </div>
        
        <Button 
          type="submit" 
          disabled={isLoading || !isValid}
          className="size-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
        >
          {isLoading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Send className="size-5" />
          )}
        </Button>
      </form>
      
      <div className="flex items-center justify-center mt-3 text-xs text-muted-foreground">
        <span>HealthAI can make mistakes. Please verify important information.</span>
      </div>
    </div>
  );
}