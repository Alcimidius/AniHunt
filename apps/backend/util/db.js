import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from "dotenv";
import { fetchN } from './apiFetch.js';
import { addSearchDocumentEmbeddings, getQueryEmbeddings } from './embedding.js';
dotenv.config();

const uri = process.env.DATABASE_URL;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  }
});

async function createVectorIndex(collectionName){
  try {
    const database = client.db(process.env.DATABASE_NAME);
    const collection = database.collection(collectionName);
    const index = {
      name: "vector_index",
      type: "vectorSearch",
      definition: {
        "fields": [
          {
            "type": "vector",
            "path": "embedding",
            "similarity": "dotProduct",
            "numDimensions": 768
             }
              ]
         },
     }
    const result = await collection.createSearchIndex(index);
    console.dir("Created index vector: "+result);
  }catch(error){
    console.error(error);
  }finally{
    await client.close();
  }
}

async function search_query(mediaType,query) {
  try{
    await client.connect();
    const database = client.db(process.env.DATABASE_NAME);
    const collection = database.collection(mediaType);

    const queryEmbedding =await getQueryEmbeddings(query);

    const pipeline = [
      {
        $vectorSearch: {
          index: "vector_index",
          queryVector: queryEmbedding,
          path: "embedding",
          exact: false,
          limit: 5,
          numCandidates: 100,
        }
      },
      {
        $project: {
          _id: 0,
          title: 1,
          description: 1,
          score: {
            $meta: "vectorSearchScore"
          }
        }
      }
    ];
  
    const result = await collection.aggregate(pipeline).toArray();
    return result;
  }catch(err){
    console.error(err);
  }finally{
    await client.close();

  }
}

async function insertMedia(mediaType,num) {
  try {

    await client.connect();
    const database = client.db(DATABASE_NAME);
    const collection = database.collection(mediaType);
    
    let media = await fetchN("ANIME", num);
    await addSearchDocumentEmbeddings(media)
    const insertManyresult = await collection.insertMany(media);
    let ids = insertManyresult.insertedIds;
    console.log(`${insertManyresult.insertedCount} documents were inserted.`);
    for (let id of Object.values(ids)) {
      console.log(`Inserted a document with id ${id}`);
    }

  } catch (error) {
    console.error(error);
  }
  finally {
    await client.close();
  }
}

try{
  const res = await search_query("ANIME","sad emotional anime with character death");
  console.dir(res);
} catch (err){
  console.error(err);
}
//await createVectorIndex("ANIME");
//await insertMedia("ANIME",100);
/* createColl("MANGA");
insertMedia("MANGA", 100); */