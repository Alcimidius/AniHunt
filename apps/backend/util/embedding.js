import { Ollama } from 'ollama'
import { fetchN } from './apiFetch.js';
import sanitizeHtml from 'sanitize-html';

const ollama = new Ollama({ host: 'http://127.0.0.1:12434' })
const media = await fetchN("ANIME", 10);

//768 vector length

async function addEmbeddings(data) {

    for (let item of data) {
        const sentence = `${item.genres} | ${item.tags} | ${sanitizeHtml(item.description, {
            allowedTags: [],
            allowedAttributes: {}
        }).replace(/[\"\r\n\t]/g, '')}`;

        const response = await ollama.embed({
            model: 'nomic-embed-text:v1.5',
            input: `search_document: ${sentence}`,
        })

        item.embedding = response.embeddings[0];

        console.dir(item);
    }
}

export {addEmbeddings}

/* import dotenv from "dotenv";


dotenv.config();

async function embed(sentences) {
    const response = await fetch(process.env.MODAL_ENDPOINT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentences })
    })
    const { embeddings } = await response.json()
    return embeddings
} */
