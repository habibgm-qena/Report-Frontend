export interface ChatCompletionRequest {
    model: string;
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    n?: number;
    stream?: boolean;
}

export interface ChatCompletionResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    choices: Array<{
        index: number;
        message: { role: 'assistant'; content: string };
        finish_reason: string;
    }>;
}
