import ollama from 'ollama'

const response = await ollama.embed({
    model: 'nomic-embed-text',
    input: [
        'Naruto is a ninja story',
        'One Piece is about pirates'
    ],
});

console.log(response.embeddings);