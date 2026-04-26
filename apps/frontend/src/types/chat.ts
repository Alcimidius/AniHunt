import type { ChatResponse } from 'shared/ChatResponse';

export type Role = "User" | "System";

export type ConversationItem = {
    userType: Role
    content: ChatResponse
}