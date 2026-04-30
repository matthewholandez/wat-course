import { Metadata } from "next";
import { Chat } from "./Chat";

export const metadata: Metadata = {
    title: 'Chat'
};

export default function ChatPage() {
    return <Chat />;
}
