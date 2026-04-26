<script setup lang="ts">
import { ConversationItem } from '@/types/chat';
import { ref, nextTick } from 'vue';

import chatbubble from '@/components/chatbubble.vue';

const url = "http://127.0.0.1:10000/chat"
let ConversationHistory = ref<ConversationItem[]>([]);
let query= ref("");
let loading = ref<boolean>(false);

const bottomRef = ref<HTMLElement | null>(null);

async function scrollToBottom() {
    await nextTick();
    bottomRef.value?.scrollIntoView({ behavior: 'smooth' });
}
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

        const temp: ConversationItem = {
            userType: "System",
            content: {
                msg: body.msg,
                ...(body.media ? { media: body.media } : {})
            }
        };

        ConversationHistory.value.push(temp);
        await scrollToBottom();
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

            <div ref="bottomRef"></div>

            <input v-model="query" placeholder="what are you looking for?">
            <button @click="handleSubmit" class="btn btn-primary">
                Send
            </button>
        </div>
    </div>
</template>
