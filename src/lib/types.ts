// Types for the chat application
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

export interface ChatError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface ApiResponse {
  response?: string;
  error?: string;
}

// Chat form props
export interface ChatFormProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

// Message component props
export interface ChatMessageProps {
  message: Message;
}

// API request types
export interface ChatRequest {
  prompt: string;
  context?: string;
}

export interface ChatResponse {
  response: string;
  timestamp: string;
}