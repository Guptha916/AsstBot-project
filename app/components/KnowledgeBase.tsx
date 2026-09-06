'use client';

import { ChangeEvent, useRef, useState } from 'react';
type Document = { fileName: string; chunks: number; characters: number };

export default function KnowledgeBase({ documents, onChange }: { documents: Document[]; onChange: (documents: Document[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setBusy(true);
    setStatus('Reading and indexing your files...');
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    try {
      const response = await fetch('/api/documents', { method: 'POST', body: formData });
      const data = await readResponse(response);
      if (!response.ok) throw new Error(data.error || 'The files could not be indexed.');

      onChange(data.documents || []);
      setStatus(`${files.length} file${files.length === 1 ? '' : 's'} indexed successfully`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Upload failed. Please try again.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function clear() {
    const response = await fetch('/api/documents', { method: 'DELETE' });
    if (response.ok) {
      onChange([]);
      setStatus('Knowledge base cleared');
    }
  }

  return (
    <aside className="knowledge-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Retrieval layer</p>
          <h2>Knowledge base</h2>
        </div>
        <span className="file-count" aria-label={`${documents.length} files`}>{documents.length}</span>
      </div>
      <p className="panel-copy">Upload source material and ask questions grounded in its content.</p>
      <input ref={inputRef} type="file" multiple accept=".pdf,.docx,.txt,.md,.csv,.json,.html,.xml" onChange={upload} hidden />
      <button className="upload-button" onClick={() => inputRef.current?.click()} disabled={busy}>
        {busy ? 'Indexing files...' : '+ Add files'}
      </button>
      <div className="document-list">
        {documents.map((document) => (
          <div className="document-item" key={document.fileName}>
            <strong title={document.fileName}>{document.fileName}</strong>
            <span>{document.chunks} chunks · {(document.characters / 1000).toFixed(1)}k chars</span>
          </div>
        ))}
      </div>
      {documents.length > 0 && <button className="clear-button" onClick={clear}>Clear knowledge base</button>}
      <p className="status-text" aria-live="polite">{status}</p>
      <p className="guardrail-note">10 MB per file · up to 5 files · text-based files only</p>
    </aside>
  );
}

async function readResponse(response: Response): Promise<{ documents?: Document[]; error?: string }> {
  const body = await response.text();
  try {
    return JSON.parse(body);
  } catch {
    return { error: response.ok ? 'The server returned an unreadable response.' : `Server error (${response.status}). Restart the app and try again.` };
  }
}