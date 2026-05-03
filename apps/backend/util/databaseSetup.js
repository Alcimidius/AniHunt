import dotenv from "dotenv";
dotenv.config();

import { Document } from "@langchain/core/documents";
import { fetchN } from './apiFetch.ts';
import { vectorStore } from "./clients.ts";

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




try {
    console.log("fetching:");
    const data = await fetchN("ANIME", 10);
    console.log("seeding:");
    await upsertBatch(data);
    console.log("db setup done");
} catch (err) {
    console.error(err);
}



