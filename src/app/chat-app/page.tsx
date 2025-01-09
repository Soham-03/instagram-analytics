import Image from "next/image";
import Chat from "@/components/Chat";

export default function ChatApp() {
  return (
    <main className="container mx-auto p-4 min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-8">Langflow Chat</h1>
      <Chat />
    </main>
  );
}
