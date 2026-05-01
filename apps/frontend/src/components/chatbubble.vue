<script setup lang="ts" >
import { ConversationItem } from '@/types/chat';
import mediaCarousel from './mediaCarousel.vue';
import { ref, watchEffect } from 'vue';
import { marked } from 'marked';


const props = defineProps<{
    item: ConversationItem;
}>();   



const formattedText = ref('');

const isUser = (props.item.userType === "User");
const classAttr = (isUser) ? "chat-start" : "chat-end";

const date = new Date();

watchEffect(async () => {
    formattedText.value = await marked.parse(props.item.content.msg || '');
});

</script>

<template>
    <div class="chat" :class = classAttr>
        <div class="chat-header">
            <time class="text-xs opacity-50">{{ date.toLocaleString() }}</time>
        </div>
        <div class="chat-bubble" v-html="formattedText"></div>
    </div>
    <div v-if=item.content.media class="chat" :class=classAttr>
        <div class="chat-bubble p-2 max-w-md overflow-visible">
            <mediaCarousel :media-list="item.content.media" />
        </div>
    </div>

</template>


