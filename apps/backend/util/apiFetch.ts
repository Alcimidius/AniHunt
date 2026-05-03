'use strict'
import sanitizeHtml from 'sanitize-html';
import type {Media} from "shared/Media";
import type { MediaApi, FilteredPage } from './apiFetchType';
const ANILIST_URL = "https://graphql.anilist.co"
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

function transformMedia(item: MediaApi) :Media{
  return {
    mediaId: item.mediaId,
    title: item.title?.english ?? "",
    type: item.type ?? "",
    format: item.format ?? "",
    description: sanitizeHtml(item.description ?? "", {
      allowedTags: [],
      allowedAttributes: {}
    }).replace(/\(Source:.*$/is, "")
      .replace(/[\n\r]/g, ''),
    startYear: item.startDate?.year ?? 0,
    startMonth: item.startDate?.month ?? 0,
    episodes: item.episodes ?? 0,
    status: item.status ?? "",
    coverImage: item.coverImage?.extraLarge ?? "",
    genres: item.genres ?? [],
    tags: item.tags
      ?.filter(tag => !tag.isAdult && !tag.isGeneralSpoiler && tag.rank >= TAG_ACCURACY)
      .map(tag => tag.name) ?? [],
  }
}

function filterPage(data: any): FilteredPage  {
  return {
    hasNextPage: data.Page.pageInfo.hasNextPage,
    media: data.Page.media.map(transformMedia),
  }
}

async function fetchPage(type: string, page : number) {

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
    const retryAfter = (parseInt(response.headers.get('Retry-After') ?? '1') || 60) * 1000;
    console.warn(`Rate limited, waiting ${retryAfter / 1000}s...`);
    await new Promise(r => setTimeout(r, retryAfter));
    return fetchPage(type, page);
  }

  const { data, errors } = await response.json()
  if (errors) throw errors

  return filterPage(data);

}


async function fetchN(type : string, N: number) {
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

export { fetchN }