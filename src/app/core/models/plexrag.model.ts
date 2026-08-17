// Mirrors PlexRag.Application.Dtos, consumed via PlexApiClient's chat endpoints.

export interface ChatRequest {
  question: string;
}

export interface ChatContextItem {
  ratingKey: string;
  title: string;
  score: number;
}

export interface SimpleChatResponse {
  answer: string;
  context: ChatContextItem[];
}

export interface AgentToolCall {
  tool: string;
  argumentsJson: string;
  result: string;
}

export interface AgentChatResponse {
  answer: string;
  toolCalls: AgentToolCall[];
}

/** Which backend endpoint the "Agent" tab's internal toggle targets. */
export type AgentEngine = 'agent';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'error';
  text: string;
  timestamp: string;
  context?: ChatContextItem[];
  toolCalls?: AgentToolCall[];
}
