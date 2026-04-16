'use strict'
import { HFclient, vectorStore } from "./util/clients.js";
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
        coverImage: doc.metadata.coverImage,
        format: doc.metadata.format,
        startYear: doc.metadata.startYear,
        startMonth: doc.metadata.startMonth,
        episodes: doc.metadata.episodes,
        status: doc.metadata.status,
        //score: score,
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
    return sorted.slice(0, topK).map((item) => item.doc);
}


/* try {

    const query = "mature adult romance";
    const rec = await recommend(query);
    const final = await rerank(query, rec, 5)


} catch (err) {
    console.dir(err,{depth:null});
} */

export{recommend,rerank}