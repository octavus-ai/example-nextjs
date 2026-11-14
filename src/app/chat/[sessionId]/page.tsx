import { notFound, redirect } from 'next/navigation';
import { isNotFoundError } from '@octavus/server-sdk';
import { getOctavusClient } from '@/lib/octavus';
import { getOctavusPlatformUrl } from '@/lib/server-config';
import { ChatInterface } from '@/features/chat';

interface ChatPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { sessionId } = await params;
  const client = getOctavusClient();

  let session;
  try {
    session = await client.sessions.get(sessionId);
  } catch (error) {
    if (isNotFoundError(error)) {
      notFound();
    }
    throw error;
  }

  // Expired sessions have no state left - start a new chat
  if (session.status === 'expired') {
    redirect('/');
  }

  const messages = await client.sessions.getMessages(sessionId);

  return (
    <ChatInterface
      sessionId={sessionId}
      initialMessages={messages}
      platformUrl={getOctavusPlatformUrl()}
    />
  );
}
