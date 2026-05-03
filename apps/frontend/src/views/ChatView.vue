<script setup lang="ts">
import { ConversationItem } from '@/types/chat';
import { ref, nextTick} from 'vue';


import chatbubble from '@/components/chatbubble.vue';

const url = "http://127.0.0.1:10000/chat"

const loadingContersationItem: ConversationItem = {
    userType: "System",
    content: {
        msg: ". . ."
    }
};

let ConversationHistory = ref<ConversationItem[]>([]);
let query= ref("");
let loading = ref<boolean>(false);

async function handleSubmit() {
    if(!query.value) return;
    if(query.value.trim().length === 0) return;

    const temp: ConversationItem = {
        userType: "User",
        content: {
            msg: query.value
        }
    };
    ConversationHistory.value.push(temp);
    ConversationHistory.value.push(loadingContersationItem);
    loading.value = true;

    try{
        const res = await fetch(url,{
            headers:{
                "Content-Type": "application/json",
            },
            method:"POST",
            body: JSON.stringify({ msg: query.value}),
        })


        const body = await res.json();

        if (!res.ok) {

            throw new Error(
                `HTTP ${res.status} ${res.statusText}: ${body.msg}`
            );
        }


        const temp: ConversationItem = {
            userType: "System",
            content: {
                msg: body.msg,
                ...(body.media ? { media: body.media } : {})
            }
        };

        ConversationHistory.value.pop();
        ConversationHistory.value.push(temp);
        loading.value = false;
        
    }catch(err){
        alert(err);
        ConversationHistory.value.pop();
        loading.value = false;
    }
    query.value = "";
}
</script>

<template>
    <div class="h-screen flex flex-col items-center">
        
        <div class="w-full max-w-4xl flex-1 overflow-y-auto px-4">
            <div v-for="(message, index) in ConversationHistory" :key="index" class="mb-4">
                <chatbubble :item="message" />
            </div>

        </div>


        <div class="w-full max-w-4xl p-4 flex gap-2">
            <input v-model="query" class="input input-bordered flex-1" placeholder="what are you looking for?">
            <button @click="handleSubmit" class="btn btn-primary">
                Send
            </button>
        </div>

    </div>
</template>
