import { callOpenAI } from '@/utils/openai';

export interface CropRecommendation {
    crop: string;
    summary: string;
    icon: string;
    detailed: string;
}

export interface FertilizerRecommendation {
    fertilizer: string;
    composition: string;
    recommendation: string;
    alignment: string;
}

export interface Recommendations {
    crops: CropRecommendation[];
    fertilizers: FertilizerRecommendation[];
}

export async function getAgroRecommendations(crops: string[], fertilizers: string[]): Promise<Recommendations> {
    const cropList = crops.map((c) => `- ${c}`).join('\n');
    const fertList = fertilizers.map((f) => `- ${f}`).join('\n');
    const prompt = `You are a data-driven agronomy specialist. Using machine learning insights based on location-specific latitude and longitude inputs, generate tailored crop and fertilizer recommendations in JSON format. Follow these instructions exactly:

1. Input Lists
- For "crops", use the list:
${cropList}
- For "fertilizers", use the list:
${fertList}

2. JSON Structure
Return a single JSON object with two top-level arrays: "crops" and "fertilizers".

"crops" array items must each include:
  - "crop": The crop name as a string.
  - "summary": A one-sentence recommendation highlight (e.g., "Recommend Maize because...").
  - "icon": A relevent icon in string format (e.g., "🌽").
  - "detailed": A paragraph explaining in detail:
      • Why this crop is suitable at the given coordinates.
      • Key environmental or soil conditions it thrives in.
      • Any special cultivation considerations.

"fertilizers" array items must each include:
  - "fertilizer": The fertilizer name as a string.
  - "composition": Its primary nutrient composition (e.g., "N-P-K ratio").
  - "recommendation": Contextual guidance on when and why to apply it.
  - "alignment": Explanation of how it addresses specific crop requirements or corrects local soil deficiencies.

3. Data-Driven Rationale
Ensure every recommendation explicitly references that it is based on machine learning analysis of local agro-ecological data (soil tests, climate records, historical yields).

4. Response Format
- Respond with valid JSON only, no additional text or code fences.
- Maintain the exact structure; do not wrap in markdown.
- Use double quotes for all JSON keys and string values.
`;

    const response = await callOpenAI({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }]
    });

    return JSON.parse(response) as Recommendations;
}
