export type MediaApi = {
    mediaId: number;
    title?: { english?: string | null };
    type?: string | null;
    format?: string | null;
    description?: string | null;
    startDate?: { year?: number | null; month?: number | null } | null;
    episodes?: number | null;
    status?: string | null;
    coverImage?: { extraLarge?: string | null } | null;
    genres?: string[] | null;
    tags?: Array<{
        name: string;
        isAdult: boolean;
        isGeneralSpoiler: boolean;
        rank: number;
    }> | null;
};

export type FilteredPage = {
    hasNextPage: boolean,
    media: MediaApi[],
};