<script setup lang="ts">
import { ConversationItem } from '@/types/chat';
import { ref } from 'vue';

import chatbubble from '@/components/chatbubble.vue';
import { Media } from 'shared/Media';
import MediaCard from '@/components/mediaCard.vue';

const url = "http://127.0.0.1:10000/chat"
let ConversationHistory = ref<ConversationItem[]>([]);
let query= ref("");
let loading = ref<boolean>(false);

let temp: ConversationItem = {
    userType : "User",
    content : {
        msg:"1"
    }
}

let media = ref< Media >({
    mediaId: 123,
    title: "mediaTitle",
    type: "anime",
    format: "TV",
    description: "loremosdisaoisdaoidjsajid",
    startYear: 2020,
    startMonth: 1,
    episodes: 123,
    status: "FINISHED",
    coverImage: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
    genres: ["action", "3", "321"],
    tags: ["32131", "321", "34145678"],
})
ConversationHistory.value.push(temp);
 temp = {
    userType: "System",
    content: {
         msg: "2",
         media: [media.value,media.value]
     }
}
ConversationHistory.value.push(temp);
temp = {
    userType: "System",
    content: {
        msg: "2",
        media: [media.value, media.value]
    }
}
ConversationHistory.value.push(temp);

async function handleSubmit() {
    try{
        const res = await fetch(url,{
            headers:{
                "Content-Type": "application/json",
            },
            method:"POST",
            body: JSON.stringify({ msg: query.value}),
        })
        const body = await res.json()

        if(body.media){
            let temp: ConversationItem = {
                userType: "System",
                content: {
                    msg : body.msg,
                    media : body.media
                }
            }

            ConversationHistory.value.push(temp);
        }else{
            let temp: ConversationItem = {
                userType: "System",
                content: {
                    msg: body.msg
                }
            }

            ConversationHistory.value.push(temp);
        }
    }catch(err){
        alert(err);
    }
}
</script>

<template>
    <div class ="flex flex-col items-center">
        <div class="w-full max-w-3xl">
            <div v-for="(message, index) in ConversationHistory">
                <chatbubble :item=message :key=index></chatbubble>
            </div>
            <input v-model="query" placeholder="what are you looking for?">
            <button @click="handleSubmit" class="btn btn-primary">
                Send
            </button>
        </div>
    </div>
</template>
