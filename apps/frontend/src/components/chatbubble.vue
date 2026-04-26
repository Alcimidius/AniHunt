<script setup lang="ts" >
import { ConversationItem } from '@/types/chat';

const props = defineProps<{
    item: ConversationItem;
}>();


const isUser = (props.item.userType === "User");
const classAttr = (isUser) ? "chat-start" : "chat-end";

const date = new Date();
</script>

<template>
    <div class="chat" :class = classAttr>
        <div class="chat-header">
            <time class="text-xs opacity-50">{{ date.toLocaleString() }}</time>
        </div>
        <div class="chat-bubble">{{item.content.msg}}</div>
    </div>
    <div v-if=item.content.media class="chat" :class=classAttr>
        <div class="chat-bubble">{{ item.content.media }}</div>
    </div>

</template>


