import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from "dotenv";
import { fetchN } from './apiFetch.js';
import { addEmbeddings } from './embedding.js';
dotenv.config();

const uri = process.env.DATABASE_URL;
console.log("URI:", process.env.DATABASE_URL);
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function createColl(name) {
  try {
    
    await client.connect();
    const database = client.db("AniHunt");
    const createColl = await database.createCollection(name);

  } catch(error){
    console.error(error);
  }
  finally {
    await client.close();
  }
}

async function insertMedia(mediaType,num) {
  try {

    await client.connect();
    const database = client.db("AniHunt");
    const collection = database.collection(mediaType);
    
    let media = await fetchN("ANIME", num);
    await addEmbeddings(media)
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

await createColl("ANIME");
await insertMedia("ANIME",100);
/* createColl("MANGA");
insertMedia("MANGA", 100); */