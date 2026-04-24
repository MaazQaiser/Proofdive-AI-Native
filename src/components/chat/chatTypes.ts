export type ChatRole = "assistant" | "user" | "system";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

