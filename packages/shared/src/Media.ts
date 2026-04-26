export interface Media {
    mediaId: number,
    title: string,
    type: string,
    format: string,
    description: string,
    startYear: number,
    startMonth: number,
    episodes: number,
    status: string,
    coverImage: string,
    genres: string[],
    tags: string[],
  }