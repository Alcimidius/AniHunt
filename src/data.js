import fs from "node:fs";
import { parse } from "csv-parse";

/* const API_URL = "https://graphql.anilist.co"; */

async function saveToJson(filePath, data) {

  const json = JSON.stringify(data, null, 2);

  await fs.writeFile(filePath, json, "utf-8", (err) => {
    if (err) {
      console.error('Error writing to file', err);
    } else {
      console.log('Data written to file');
    }
  });
}

async function parseCSV(filePath) {
  const records = [];

  const parser = fs.createReadStream(filePath).pipe(
    parse({
      columns: true
    }),
  );

  let x =0;
  for await (const record of parser) {
    if (record.isAdult === "False") {

      const selected = {
        id: parseInt(record.id),
        title_romaji: record.title_romaji,
        title_english: record.title_english,
        description: record.description,
        type: record.type,
        startDate_year: parseInt(record.startDate_year),
        endDate_year: parseInt(record.endDate_year),
        episodes: parseInt(record.episodes),
        coverImage_extraLarge: record.coverImage_extraLarge,
        genres: record.genres,
        tags: JSON.parse(record.tags)
      };

      selected.tags = selected.tags.map(tag => tag.name);
        
      console.log(JSON.stringify(selected.tags, 2, 2));
      console.log(selected.tags[0].id);
      
      records.push(selected);
      x++;
      if(x === 1) break;
    }
  }

  return records;
}

const inputPath = "C:/Users/guojie/Downloads/data/anilist_anime_data_complete.csv";
const outputPath = "C:/Users/guojie/Downloads/data/anime.json";

const data = await parseCSV(inputPath).then(console.dir);
//const data = await parseCSV(inputPath);
//await saveToJson(outputPath, data);
