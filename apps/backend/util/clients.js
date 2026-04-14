import { OllamaEmbeddings } from "@langchain/ollama";
import { InferenceClient } from "@huggingface/inference";
import { QdrantVectorStore } from "@langchain/qdrant";


const embeddings = new OllamaEmbeddings({
    model: "nomic-embed-text",
    baseUrl: process.env.OLLAMA_URL,
});

const HFclient = new InferenceClient(process.env.HF_API_KEY);

const GroqClient = new InferenceClient(process.env.GROQ_API_KEY);

const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
    url: process.env.QDRANT_DATABASE_URL,
    collectionName: process.env.QDRANT_COLLECTION_NAME,
});


export {HFclient, vectorStore, GroqClient }