# Octavus + Next.js Example

A chat application demonstrating Octavus integration with Next.js using HTTP/SSE transport.

## Features

- Real-time streaming responses
- Extended thinking/reasoning display
- Tool calling (current time)
- QR code generation via skills
- Image generation and file uploads
- Auto-generate chat title, summary, and cover image
- Resource synchronization (sidebar updates)
- Session management

## Quick Start

### Prerequisites

- Node.js 20+
- Octavus account with API keys

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/octavus-ai/example-nextjs.git
   cd example-nextjs
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your Octavus credentials:

   ```bash
   OCTAVUS_API_URL=https://octavus.ai
   OCTAVUS_API_KEY=your-api-key
   OCTAVUS_CLI_API_KEY=your-cli-api-key
   ```

4. Sync the agent:

   ```bash
   npm run agents:sync
   ```

   After syncing, copy the agent ID from the output and add it to `.env`:

   ```bash
   OCTAVUS_AGENT_ID=your-agent-id
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
example-nextjs/
├── octavus-agents/           # Agent definitions
│   └── assistant/
│       ├── settings.json     # Agent metadata
│       ├── protocol.yaml     # Agent protocol (triggers, tools, resources)
│       └── prompts/          # Prompt templates
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── sessions/     # POST /api/sessions - Create session
│   │   │   ├── trigger/      # POST /api/trigger - SSE streaming
│   │   │   └── upload-urls/  # POST /api/upload-urls - File uploads
│   │   ├── chat/[sessionId]/ # Chat page
│   │   └── page.tsx          # Landing page
│   ├── features/
│   │   └── chat/             # Chat UI components
│   └── lib/
│       ├── agents/           # Agent config & tool handlers
│       ├── octavus.ts        # Octavus client factory
│       └── server-config.ts  # Environment config
├── .env.example
└── package.json
```

## Octavus Integration

### Server SDK

The server SDK (`@octavus/server-sdk`) handles:

- Creating sessions via `client.agentSessions.create()`
- Attaching tool handlers via `client.agentSessions.attach()`
- Streaming responses via `toSSEStream()`
- File uploads via `client.files.getUploadUrls()`

### React SDK

The React SDK (`@octavus/react`) provides:

- `useOctavusChat` hook for chat state management
- `createHttpTransport` for HTTP/SSE transport
- Type definitions for UI messages and parts

### Tool Handlers

Tools defined in the agent protocol are implemented server-side:

```typescript
// lib/agents/assistant.ts
const tools: ToolHandlers = {
  'get-current-time': async (args) => {
    const timezone = (args.timezone as string) || 'UTC';
    const now = new Date().toLocaleString('en-US', { timeZone: timezone });
    return { time: now, timezone };
  },
};
```

### Resource Updates

Resources sync automatically via the `onResourceUpdate` callback:

```typescript
const { messages, send } = useOctavusChat({
  transport,
  onResourceUpdate: (name, value) => {
    if (name === 'CHAT_TITLE') setChatTitle(value);
    if (name === 'CHAT_SUMMARY') setChatSummary(value);
    if (name === 'CHAT_IMAGE') setChatImage(value);
  },
});
```

## Environment Variables

| Variable            | Description                              | Required |
| ------------------- | ---------------------------------------- | -------- |
| `OCTAVUS_API_URL`   | Octavus platform URL                     | No       |
| `OCTAVUS_API_KEY`   | API key for runtime                      | Yes      |
| `OCTAVUS_AGENT_ID`  | Agent ID (from sync)                     | Yes      |
| `OCTAVUS_CLI_API_KEY` | API key for CLI sync                   | No       |

## Scripts

| Script           | Description                    |
| ---------------- | ------------------------------ |
| `npm run dev`    | Start development server       |
| `npm run build`  | Build for production           |
| `npm run start`  | Start production server        |
| `npm run lint`   | Run ESLint                     |
| `npm run agents:sync` | Sync agent to Octavus     |

## Learn More

- [Octavus Documentation](https://octavus.ai/docs)
- [Server SDK Reference](https://octavus.ai/docs/server-sdk/overview)
- [Client SDK Reference](https://octavus.ai/docs/client-sdk/overview)
- [Protocol Reference](https://octavus.ai/docs/protocol/overview)

## License

MIT
