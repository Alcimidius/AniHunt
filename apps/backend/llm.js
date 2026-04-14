'use strict'
import { GroqClient } from "./util/clients.js";
import {recommend,rerank} from "./database.js"

const tools = [
    {
        type: "function",
        function: {
            name: "get_recommendations",
            description: "Search for anime recommendations based on themes, genres, moods, or similar titles. Call this whenever the user is asking for suggestions.",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "A semantic search query capturing the user's desired themes, genres, and mood. Rephrase the user input to be descriptive and rich."
                    }
                },
                required: ["query"]
            }
        }
    }
];

const conversationHistory = [];

async function getResponse(userMessage) {
    conversationHistory.push({ role: "user", content: userMessage });

    const response = await GroqClient.chatCompletion({
        model: "openai/gpt-oss-120b",
        provider: "groq",
        messages: [
            {
                role: "system",
                content: `You are a friendly anime recommendation assistant. 
Chat naturally with the user. When they want anime or manga suggestions, 
call the get_recommendations tool — do NOT answer with suggestions yourself.
For anything else (greetings, etc.) just respond normally.`
            },
            ...conversationHistory
        ],
        tools,
        tool_choice: "auto",
        max_tokens: 500,
        temperature: 0.7,
    });

    const message = response.choices[0].message;

    // LLM wants to call the tool
    if (message.tool_calls?.length > 0) {
        const toolCall = message.tool_calls[0];
        const { query } = JSON.parse(toolCall.function.arguments);

        console.log(`Tool called with query: "${query}"`);

        // Run your existing pipeline
        const candidates = await recommend(query);
        const results = await rerank(query, candidates, 5);

        // Format results for the LLM to present nicely
        const toolResult = results.map(({ doc }) => 
            `- ${doc.title}: ${doc.description?.slice(0, 100)}...`
        ).join("\n");

        // Feed tool result back so LLM can respond naturally
        conversationHistory.push({ role: "assistant", content: null, tool_calls: message.tool_calls });
        conversationHistory.push({ role: "tool", tool_call_id: toolCall.id, content: toolResult });

        const finalResponse = await GroqClient.chatCompletion({
            model: "openai/gpt-oss-120b",
            provider: "groq",
            messages: [
                { role: "system", content: "You are a friendly anime recommendation assistant. Present the results naturally and invite follow-up." },
                ...conversationHistory
            ],
            max_tokens: 500,
            temperature: 0.7,
        });

        const finalMessage = finalResponse.choices[0].message.content;
        conversationHistory.push({ role: "assistant", content: finalMessage });
        return finalMessage;
    }

    // Normal conversational reply
    conversationHistory.push({ role: "assistant", content: message.content });
    return message.content;
}

export { getResponse }