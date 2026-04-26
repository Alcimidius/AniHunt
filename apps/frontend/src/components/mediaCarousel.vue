<script setup lang="ts">
import type { Media } from 'shared/Media';
import MediaCard from './mediaCard.vue';

const props = defineProps<{
    mediaList: Media[]
}>();
const uid = Math.random().toString(36).slice(2);
</script>

<template>
    <div class="carousel rounded-box w-64">

        <div v-for="(media, index) in mediaList" :key="`${uid}-${index}`" :id="`slide-${uid}-${index}`"
            class="carousel-item w-full">
            <MediaCard :media="media" />
        </div>
    </div>

    <div class="flex w-full justify-center gap-2 py-2">
        <a v-for="(media, index) in mediaList" :key="`${uid}-${index}`" class="btn btn-xs"
            :href="`#slide-${uid}-${index}`">
            {{ index }}
        </a>
    </div>
</template>