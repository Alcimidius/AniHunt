import type { Media } from "./Media"

export interface ChatResponse{
    msg : string,
    media? : Media[],
}