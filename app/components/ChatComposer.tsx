export default function ChatComposer({ input, loading, onChange, onSend }: { input: string; loading: boolean; onChange: (value: string) => void; onSend: () => void }) {
  return (
    <div className="composer">
      <input
        value={input}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            onSend();
          }
        }}
        placeholder="Ask a question..."
        disabled={loading}
        maxLength={4000}
        aria-label="Message"
      />
      <button onClick={onSend} disabled={loading || !input.trim()} aria-label="Send message">→</button>
    </div>
  );
}