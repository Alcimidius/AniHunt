'use strict'
import { HFclient, vectorStore } from "./util/clients.js";
import { getResponse } from "./llm.js";
function buildDocString(media) {
    return `Genres: ${media.genres.join(", ")} Tags: ${media.tags.join(", ")} Description: ${media.description}`;
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

async function rerank(query, recommendations, topK = 3) {

    const inputs = recommendations.map(doc => ({
        text: buildDocString(doc)
    }));

    const output = await HFclient.textClassification({
        model: "BAAI/bge-reranker-v2-m3",
        inputs: inputs.map(i => `${query} [SEP] ${i.text}`),
        provider: "hf-inference",
    });

    const scored = recommendations.map((doc, i) => ({
        doc,
        rank_score: output[i]?.score ?? 0
    }));

    const sorted = scored.sort((a, b) => b.score - a.score);
    return sorted.slice(0, topK);
}


try {

    const query = "found family theme in a fantasy setting";
    const rec = await recommend(query);
    const final = await rerank(query, rec, 5)

    console.dir(final);

    console.dir(await getResponse(query));
} catch (err) {
    console.error(err);
}

export{recommend,rerank}