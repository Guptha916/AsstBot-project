type Mode = 'chat' | 'rag';

export default function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (mode: Mode) => void }) {
  return <div className="mode-toggle" role="group" aria-label="Assistant mode"><button className={mode === 'chat' ? 'mode-active' : ''} onClick={() => onChange('chat')}>Chat</button><button className={mode === 'rag' ? 'mode-active' : ''} onClick={() => onChange('rag')}>RAG workspace</button></div>;
}