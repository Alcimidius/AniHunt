import sanitizeHtml from 'sanitize-html';
import { Ollama } from 'ollama';
import dotenv from "dotenv";
dotenv.config();


const isLocal = process.env.LOCAL == 'true';

const ollama = isLocal
    ? new Ollama({ host: process.env.OLLAMA_URL })
    : null;


async function getEmbedding(input) {
    try{
        if (isLocal) {
            const response = await ollama.embed({
                model: 'nomic-embed-text:v1.5',
                input
            });
            return response.embeddings[0];
        } else {

        }
    }catch(err){
        console.error(err);
    }
    
}



async function addSearchDocumentEmbeddings(data) {

    await Promise.all(data.map(async (item) => {
        const sentence = `${item.genres} | ${item.tags} | ${sanitizeHtml(item.description, {
            allowedTags: [],
            allowedAttributes: {}
        }).replace(/[\"\r\n\t]/g, '')}`;

        item.embedding = await getEmbedding(`search_document: ${sentence}`);
    }));

    console.log("Document embeddings added");
}

async function getQueryEmbeddings(query) {
    return await getEmbedding(`search_document: ${query}`);
}


export { addSearchDocumentEmbeddings, getQueryEmbeddings };