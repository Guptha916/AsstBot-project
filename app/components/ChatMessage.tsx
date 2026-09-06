type ChatMessageProps = { text: string; sender: 'user' | 'bot'; sources?: string[] };

export default function ChatMessage({ text, sender, sources = [] }: ChatMessageProps) {
  return <div className={`message-row ${sender === 'user' ? 'message-row-user' : ''}`}><div className={`message-bubble ${sender === 'user' ? 'message-user' : 'message-bot'}`}>{text}{sender === 'bot' && sources.length > 0 && <div className="source-list">Sources: {sources.join(', ')}</div>}</div></div>;
}