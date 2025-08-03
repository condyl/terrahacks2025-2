import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format timestamp for display
export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// Generate a more readable ID
export function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Sanitize user input
export function sanitizeInput(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}

// Validate message content
export function isValidMessage(content: string): boolean {
  const trimmed = content.trim();
  return trimmed.length > 0 && trimmed.length <= 4000;
}

// Error handling utilities
export class ChatError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ChatError";
  }
}

export function handleApiError(error: unknown): ChatError {
  if (error instanceof ChatError) {
    return error;
  }

  if (error instanceof Error) {
    return new ChatError(error.message, "UNKNOWN_ERROR", error);
  }

  return new ChatError("An unexpected error occurred", "UNKNOWN_ERROR", error);
}
