import { QdrantVectorStore } from "@langchain/qdrant";
import { Document } from "@langchain/core/documents";
import { OllamaEmbeddings } from "@langchain/ollama";
import { InferenceClient } from "@huggingface/inference";
import { fetchN } from './apiFetch.js';

import dotenv from "dotenv";

dotenv.config();

const client = new InferenceClient(process.env.HF_API_KEY);

const embeddings = new OllamaEmbeddings({
    model: "nomic-embed-text",
    baseUrl: process.env.OLLAMA_URL,
});
const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
    url: process.env.QDRANT_DATABASE_URL,
    collectionName: "ANIME",
});

function buildDocString(media) {
    return `Genres: ${media.genres.join(", ")} Tags: ${media.tags.join(", ")} Description: ${media.description}`;
}

function getDocument(media) {
    return new Document({
        pageContent: buildDocString(media),
        metadata: media
    })
}


async function upsertBatch(mediaList, batchSize = 10) {
    const total = mediaList.length;
    let processed = 0;

    for (let i = 0; i < total; i += batchSize) {
        const batch = mediaList.slice(i, i + batchSize);

        const documents = batch.map(getDocument);
        const ids = batch.map(m => m.mediaId);

        let success = false;
        let attempts = 0;

        while (!success && attempts < 3) {
            try {
                await vectorStore.addDocuments(documents, { ids });
                success = true;
            } catch (err) {
                attempts++;
                console.error(`Batch ${i} failed (attempt ${attempts})`, err);

                if (attempts === 3) {
                    console.error(`Skipping batch starting at ${i}`);
                } else {
                    await new Promise(r => setTimeout(r, 1000 * attempts));
                }
            }
        }

        processed += batch.length;
        console.log(`Embedding: ${processed}/${total}`);
    }
}



async function recommend(query, topK = 50) {
    const results = await vectorStore.similaritySearchWithScore(
        `search_query: ${query}`,
        topK
    );

    return results.map(([doc, score]) => ({
        title: doc.metadata.title,
        genres: doc.metadata.genres,
        tags: doc.metadata.tags,
        description: doc.metadata.description,
        score: score,
    }));
}

async function rerank(query,reccomendations, topK = 3) {

    const inputs = reccomendations.map(doc => ({
        text: buildDocString(doc)
    }));

    const output = await client.textClassification({
        model: "BAAI/bge-reranker-v2-m3",
        inputs: inputs.map(i => `${query} [SEP] ${i.text}`),
        provider: "hf-inference",
    });

    const scored = reccomendations.map((doc, i) => ({
        doc,
        score: output[i]?.score ?? 0
    }));

    const sorted = scored.sort((a, b) => b.score - a.score);
    return sorted.slice(0, topK);
}



try {
    const query = "found family theme in a fantasy setting";
    const rec = await recommend(query);
    const final = await rerank(query,rec,5)

    console.dir(final);
} catch (err) {
    console.error(err);
}