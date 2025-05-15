import { ChatCompletionRequest, ChatCompletionResponse } from '@/lib/openai.types';

export async function callOpenAI(payload: ChatCompletionRequest): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) throw new Error('Missing NEXT_PUBLIC_OPENAI_API_KEY');

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`OpenAI error: ${res.status} ${err}`);
    }

    const data = (await res.json()) as ChatCompletionResponse;
    return data.choices[0].message.content;
}
