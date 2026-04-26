'use strict'
import { GroqClient } from "./util/clients.js";
import { recommend, rerank } from "./database.js"

const model = "openai/gpt-oss-120b";
const provider = "groq";
const max_tokens = 1000;
const temperature = 0.7;
const conversationHistory = [];


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



async function handleToolCall(message) {
    const toolCall = message.tool_calls[0];

    console.dir("message:\n");
    console.dir(message, { depth: null, colors: true });

    const { query } = JSON.parse(toolCall.function.arguments);

    console.log(`Tool called with query: "${query}"`);

    const candidates = await recommend(query);
    const results = await rerank(query, candidates, 5);

/*     console.dir("results:\n");
    console.dir(results, { depth: null, colors: true }); */

    const toolResult = JSON.stringify(
        results.map((item) => ({
            title: item.title,
            description: item.description,
        }))
    );
/*     console.dir(toolResult); */


    conversationHistory.push({ role: "assistant", content: null, tool_calls: message.tool_calls });
    conversationHistory.push({ role: "tool", tool_call_id: toolCall.id, content: toolResult });

    const finalResponse = await GroqClient.chatCompletion({
        model: model,
        provider: provider,
        messages: [
            {
                role: "system", content: `You are a friendly anime recommendation assistant. Present the results naturally.
                                          Don't provide suggestions other than those provided by the tool call.
                                          provide a very brief explanation on why each entry fits the user's query, use a bullet list structure.
                                          The inferface will display the rest of the information.
                                          Respond in normal text` },
            ...conversationHistory
        ],
        max_tokens: max_tokens,
        temperature: temperature,
    });

    const finalMessage = finalResponse.choices[0].message.content;

    console.dir(finalMessage,{depth:null});
    conversationHistory.push({ role: "assistant", content: finalMessage });
    return { msg: finalMessage,
        media: results
     };
}
async function getResponse(userMessage) {
    conversationHistory.push({ role: "user", content: userMessage });

    const response = await GroqClient.chatCompletion({
        model: model,
        provider: provider,
        messages: [
            {
                role: "system",
                content: `You are a friendly anime recommendation assistant. 
Chat naturally with the user. When they want anime suggestions, 
call the get_recommendations tool — do NOT answer with suggestions yourself.
For anything else (greetings, etc.) just respond normally.`
            },
            ...conversationHistory
        ],
        tools,
        tool_choice: "auto",
        max_tokens: max_tokens,
        temperature: temperature,
    });

    const message = response.choices[0].message;


    if (message.tool_calls?.length > 0) {
        return await handleToolCall(message);
    }


    conversationHistory.push({ role: "assistant", content: message.content });
    return { msg: message.content };
}

export { getResponse }