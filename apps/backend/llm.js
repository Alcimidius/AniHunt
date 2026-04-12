import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function rerank(query, candidates) {
    const prompt = `
You are a reranking system.

Given a user query and a list of items, rank them by relevance.
assign each item a relevance score from 0 to 100:
- 100 = perfect match for the query
- 0   = completely irrelevant

Be discriminating — most items should NOT score 100. Spread scores based on actual relevance.

Return ONLY valid JSON:
[
  { "title": title, "score": number }
]

Query:
${query}

Items:
${JSON.stringify(candidates,0,2)}
`;

console.log(prompt);
    const res = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
            { role: "system", content: "You are a precise ranking engine." },
            { role: "user", content: prompt }
        ],
        temperature: 0
    });

    console.log(res.choices[0].message.content);
    
    return JSON.parse(res.choices[0].message.content);
}