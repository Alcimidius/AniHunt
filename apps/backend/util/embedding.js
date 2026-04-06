/* import { Ollama } from 'ollama'

const ollama = new Ollama({ host: 'http://127.0.0.1:12434' })

const response = await ollama.embed({
    model: 'nomic-embed-text:v1.5',
    input: 'search_document: ciao',
})
function normalize(vec) {
    const norm = Math.sqrt(vec.reduce((s, x) => s + x * x, 0))
    return vec.map(x => x / norm)
}

console.log(normalize(response.embeddings[0])); */

import dotenv from "dotenv";


dotenv.config();

async function embed(sentences) {
    const response = await fetch(process.env.MODAL_ENDPOINT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentences })
    })
    const { embeddings } = await response.json()
    return embeddings
}
