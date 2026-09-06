'use client';

import { useEffect, useRef, useState } from 'react';
import ChatComposer from './components/ChatComposer';
import ChatMessage from './components/ChatMessage';
import KnowledgeBase from './components/KnowledgeBase';
import ModeToggle from './components/ModeToggle';
import styles from './page.module.css';

type Mode = 'chat' | 'rag';
type Message = { text: string; sender: 'user' | 'bot'; sources?: string[] };
type Document = { fileName: string; chunks: number; characters: number };

const SUGGESTIONS = ['Help me plan a project', 'Explain a difficult idea', 'Turn my notes into a plan'];

export default function Home() {
  const [mode, setMode] = useState<Mode>('chat');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    fetch('/api/documents')
      .then((response) => response.json())
      .then((data) => setDocuments(data.documents || []));
  }, []);

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    setMessages([]);
  }

  function resetConversation() {
    setMessages([]);
    setInput('');
  }

  async function sendMessage() {
    const message = input.trim();
    const cannotSend = !message || loading || (mode === 'rag' && documents.length === 0);
    if (cannotSend) return;

    const nextMessages = [...messages, { text: message, sender: 'user' as const }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history: messages, mode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'The assistant could not respond.');

      setMessages([
        ...nextMessages,
        {
          text: data.reply,
          sender: 'bot',
          sources: (data.sources || []).map((source: { fileName: string }) => source.fileName),
        },
      ]);
    } catch (error) {
      setMessages([
        ...nextMessages,
        { text: error instanceof Error ? error.message : 'Network error.', sender: 'bot' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function renderEmptyState() {
    const isDocumentMode = mode === 'rag';
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon} aria-hidden="true">{isDocumentMode ? '⌁' : '✦'}</div>
        <p className={styles.emptyLabel}>{isDocumentMode ? 'Document intelligence' : 'Your thinking space'}</p>
        <h2>{isDocumentMode ? 'Ask your sources' : 'What are we building today?'}</h2>
        <p className={styles.emptyDescription}>
          {isDocumentMode
            ? 'Upload a document, then ask a question. Answers will stay grounded in your files.'
            : 'Bring a question, a rough idea, or a blank page. We can shape it together.'}
        </p>
        {!isDocumentMode && (
          <div className={styles.suggestions}>
            {SUGGESTIONS.map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => setInput(suggestion)}>{suggestion}</button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <main className={`${styles.page} ${isDark ? styles.dark : ''}`}>
      <section className={styles.appShell}>
        <div className={styles.utilityBar}>
          <div className={styles.utilityBrand}><span className={styles.utilityDot} />AI-ASSTBOT</div>
          <div className={styles.utilityMeta}>
            <span className={styles.liveStatus}><i /> System ready</span>
            <span className={styles.utilityDivider} />
            <span>v1.0</span>
          </div>
        </div>

        <header className={styles.header}>
          <div className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true">✦</span>
            <div>
              <p className={styles.eyebrow}>Private assistant</p>
              <h1>{mode === 'rag' ? 'RAG workspace' : 'Open conversation'}</h1>
              <p className={styles.subtitle}>{mode === 'rag' ? 'Answers anchored to your uploaded documents.' : 'A clear place to think out loud.'}</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <ModeToggle mode={mode} onChange={changeMode} />
            <button className={styles.iconButton} onClick={resetConversation} title="Clear conversation" aria-label="Clear conversation">⌫</button>
            <button className={styles.iconButton} onClick={() => setIsDark(!isDark)} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>{isDark ? '☼' : '☾'}</button>
          </div>
        </header>

        <div className={`${styles.workspace} ${mode === 'chat' ? styles.chatOnly : ''}`}>
          {mode === 'rag' && <KnowledgeBase documents={documents} onChange={setDocuments} />}
          <section className={styles.chatPane} aria-label="Conversation">
            <div className={styles.chatTopline}>
              <span>{mode === 'rag' ? 'RETRIEVAL SESSION' : 'GENERAL SESSION'}</span>
              <span>{mode === 'rag' ? `${documents.length} source${documents.length === 1 ? '' : 's'} indexed` : 'Context aware'}</span>
            </div>
            <div className={styles.messages}>
              {messages.length === 0 && renderEmptyState()}
              {messages.map((message, index) => <ChatMessage key={`${message.sender}-${index}`} {...message} />)}
              {loading && <div className={styles.typing}>Assistant is thinking<span>...</span></div>}
              <div ref={endRef} />
            </div>
            <footer className={styles.footer}>
              <ChatComposer input={input} loading={loading} onChange={setInput} onSend={sendMessage} />
              <p className={styles.composerHint}>Enter to send <span>·</span> Shift + Enter for a new line</p>
            </footer>
          </section>
        </div>
      </section>
    </main>
  );
}
