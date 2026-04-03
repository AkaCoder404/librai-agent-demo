import { Chat } from "@/components/chat/chat";

interface ChatPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params;

  return (
    <main className="flex h-[calc(100vh-4rem)] flex-col">
      <Chat id={id} />
    </main>
  );
}
