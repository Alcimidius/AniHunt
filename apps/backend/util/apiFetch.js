import fs from "node:fs/promises"
const ANILIST_URL = "https://graphql.anilist.co"
const FOLLOWABLE_RELATIONS = new Set(["PREQUEL", "SEQUEL", "ADAPTATION", "PARENT", "SIDE_STORY"])
const TAG_ACCURACY = 70;
const query = `
query Query($page: Int, $perPage: Int, $isAdult: Boolean, $sort: [MediaSort], $asHtml: Boolean, $type: MediaType) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      hasNextPage
    }
    media(isAdult: $isAdult, sort: $sort, type: $type) {
      id
      title {
        english
      }
      genres
      type
      format
      episodes
      chapters
      status
      startDate {
        month,year
      }
      endDate {
        month,year
      }
      description(asHtml: $asHtml)
      coverImage {
        extraLarge
      }
      popularity
      tags {
        name
        isAdult
        isGeneralSpoiler
        rank
      }
    }
  }
}
`

function transformMedia(item) {
  return {
    mediaId: item.id,
    title: item.title,
    type: item.type,
    format: item.format,
    description: item.description,
    startYear: item.startDate.year,
    startMonth: item.startDate.month,
    episodes: item.episodes,
    chapters: item.chapters,
    status: item.status,
    coverImage: item.coverImage.extraLarge,
    genres: item.genres,
    popularity: item.popularity,
    tags: item.tags
      .filter(tag => !tag.isAdult && !tag.isGeneralSpoiler && tag.rank >= TAG_ACCURACY)
      .map(tag => tag.name),
  }
}
function filterPage(data) {
  return {
    hasNextPage: data.Page.pageInfo.hasNextPage,
    media: data.Page.media.map(transformMedia),
  }
}

async function fetchPage(type, page) {

  const variables = {
    "page": page,
    "perPage": 50,
    "isAdult": false,
    "sort": "POPULARITY_DESC",
    "asHtml": false,
    "type": type
  }

  const response = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query: query,
      variables: variables
    })
  })

  if (response.status === 429) {
    const retryAfter = (response.headers.get('Retry-After') ?? 60) * 1000
    console.warn(`Rate limited, waiting ${retryAfter / 1000}s...`)
    await new Promise(r => setTimeout(r, retryAfter))
    return fetchPage(type, page)
  }

  const { data, errors } = await response.json()
  if (errors) throw errors

  return filterPage(data);

}


async function fetchN(type, N) {
  const results = []
  let page = 1

  while (results.length < N) {
    const { hasNextPage, media } = await fetchPage(type, page)
    results.push(...media)
    console.log(`${type} page ${page} — ${results.length} entries`);

    if (!hasNextPage) break
    page++
    await new Promise(r => setTimeout(r, 600)) // req/min limit
  }

  return results.slice(0, N)
}

/* 
const anime = await fetchN("ANIME", 10);

await fs.writeFile("anime.json", JSON.stringify(anime, null, 2)); */

export { fetchN }