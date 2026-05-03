'use strict'
import { HFclient, vectorStore } from "./util/clients.ts";
import type { Media } from "shared/Media";
function buildDocString(media : Media) {
    return `Genres: ${media.genres.join(", ")} Tags: ${media.tags.join(", ")} Description: ${media.description}`;
}

async function recommend(query: string, topK = 50) :Promise<Media[]>{

    const results = await vectorStore.similaritySearchWithScore(
        `search_query: ${query}`,
        topK
    );

    return results.map(([doc, score]) => ({
        mediaId: doc.metadata.mediaId,
        type: doc.metadata.type,
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
    }));
}

async function rerank(query: string, recommendations: Media[], topK = 3): Promise<Media[]> {
    if (recommendations.length === 0) {
        throw new Error("recommendations array is empty");
    }

    const scores = await Promise.all(
        recommendations.map((doc) =>
            HFclient.textClassification({
                model: "BAAI/bge-reranker-v2-m3",
                inputs: `[${query} , ${buildDocString(doc)}]`,
                provider: "hf-inference",
            }).then((output) => output[0]?.score ?? 0)
        )
    );

    return recommendations
        .map((doc, i) => ({ doc, rank_score: scores[i] }))
        .sort((a, b) => b.rank_score - a.rank_score)
        .slice(0, topK)
        .map((item) => item.doc);
}


export{recommend,rerank}