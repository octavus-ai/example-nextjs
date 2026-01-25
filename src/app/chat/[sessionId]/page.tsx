import { notFound, redirect } from 'next/navigation';
import { getOctavusClient } from '@/lib/octavus';
import { getOctavusPlatformUrl } from '@/lib/server-config';
import { ChatInterface } from '@/features/chat';
import { ApiError } from '@octavus/server-sdk';

interface ChatPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { sessionId } = await params;

  // Fetch session state with messages
  let sessionState;
  try {
    const client = getOctavusClient();
    sessionState = await client.agentSessions.getMessages(sessionId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  // Handle expired sessions - redirect to create a new one
  if (sessionState.status === 'expired') {
    redirect('/');
  }

  const platformUrl = getOctavusPlatformUrl();

  return (
    <ChatInterface
      sessionId={sessionId}
      initialMessages={sessionState.messages}
      platformUrl={platformUrl}
    />
  );
}
