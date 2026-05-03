<script setup lang="ts">
import type { Media } from 'shared/Media';


    const {media} = defineProps<{
    media: Media,
}>();

</script>


<template>
        <div class="card bg-base-100 w-full max-w-md">

            <figure>
                <img :src="media.coverImage" />
            </figure>

            <div class="card-body flex flex-col gap-1">
                <h2 class="card-title text-base ">
                    {{ media.title }}
                </h2>

                <p class="text-xs">
                    {{ media.format }} {{ media.startYear }}/{{ media.startMonth }} • {{ media.status }}
                </p>

                <p class="text-xs">
                    Episodes: {{ media.episodes ?? 'N/A' }}
                </p>

                <p class= "text-sm leading-relaxed">
                    {{ media.description }}
                </p>

                <div class="flex flex-wrap gap-1 mt-2">
                    <span v-for="genre in media.genres " :key="genre" class="badge badge-md badge-primary badge-outline">
                        {{ genre }}
                    </span>
                </div>

                <div class="flex flex-wrap gap-1 mt-2">
                    <span v-for="tag in media.tags" :key="tag" class="badge badge-xs badge-secondary badge-outline">
                        {{ tag }}
                    </span>
                </div>
            </div>
        </div>
</template>