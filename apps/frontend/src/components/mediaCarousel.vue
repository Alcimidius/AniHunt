<script setup lang="ts">
import type { Media } from 'shared/Media';
import MediaCard from './mediaCard.vue';

const props = defineProps<{
    mediaList: Media[]
}>();
const uid = Math.random().toString(36).slice(2);
</script>

<template>
    <div class="w-80 relative"> 

        <div class="carousel w-full rounded-box">

            <div v-for="(media, index) in mediaList" :key="`${uid}-${index}`" :id="`slide-${uid}-${index}`"
                class="carousel-item relative w-full justify-center">
                <MediaCard :media="media" />
            </div>

        </div>
        <div class="mt-2 flex justify-center gap-1">
            <a v-for="(_, i) in mediaList" :key="i" :href="`#slide-${uid}-${i}`" class="btn btn-xs">
                {{ i + 1 }}
            </a>
        </div>
    </div>
</template>