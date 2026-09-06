import type { ReactNode } from 'react';

type ChatMessageProps = { text: string; sender: 'user' | 'bot'; sources?: string[] };

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\[[^\]]+\]\([^)]+\)|(?<!\w)\*[^*\n]+\*(?!\w)|(?<!\w)_[^_\n]+_(?!\w))/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') || part.startsWith('__')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith('`')) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }

    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    if (link) {
      return <a key={index} href={link[2]} target="_blank" rel="noreferrer">{link[1]}</a>;
    }

    if (part.startsWith('*') || part.startsWith('_')) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    return part;
  });
}

function formatBotText(text: string): ReactNode[] {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const content: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.trim().startsWith('```')) {
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        codeLines.push(lines[index]);
        index += 1;
      }
      index += 1;
      content.push(<pre key={`code-${index}`}><code>{codeLines.join('\n')}</code></pre>);
      continue;
    }

    const heading = line.match(/^\s*(#{1,3})\s+(.+)$/);
    if (heading) {
      const Heading = `h${heading[1].length}` as 'h1' | 'h2' | 'h3';
      content.push(<Heading key={`heading-${index}`}>{renderInline(heading[2])}</Heading>);
      index += 1;
      continue;
    }

    const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
    if (unordered) {
      const items: ReactNode[] = [];
      while (index < lines.length) {
        const item = lines[index].match(/^\s*[-*+]\s+(.+)$/);
        if (!item) break;
        items.push(<li key={index}>{renderInline(item[1])}</li>);
        index += 1;
      }
      content.push(<ul key={`list-${index}`}>{items}</ul>);
      continue;
    }

    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (ordered) {
      const items: ReactNode[] = [];
      while (index < lines.length) {
        const item = lines[index].match(/^\s*\d+[.)]\s+(.+)$/);
        if (!item) break;
        items.push(<li key={index}>{renderInline(item[1])}</li>);
        index += 1;
      }
      content.push(<ol key={`ordered-list-${index}`}>{items}</ol>);
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      content.push(<blockquote key={`quote-${index}`}>{renderInline(line.replace(/^\s*>\s?/, ''))}</blockquote>);
      index += 1;
      continue;
    }

    const paragraph: string[] = [];
    while (index < lines.length && lines[index].trim() &&
      !/^\s*(#{1,3})\s+/.test(lines[index]) &&
      !/^\s*[-*+]\s+/.test(lines[index]) &&
      !/^\s*\d+[.)]\s+/.test(lines[index]) &&
      !/^\s*>\s?/.test(lines[index]) &&
      !lines[index].trim().startsWith('```')) {
      paragraph.push(lines[index]);
      index += 1;
    }
    content.push(<p key={`paragraph-${index}`}>{renderInline(paragraph.join(' '))}</p>);
  }

  return content;
}

export default function ChatMessage({ text, sender, sources = [] }: ChatMessageProps) {
  const isBot = sender === 'bot';

  return (
    <div className={`message-row ${sender === 'user' ? 'message-row-user' : ''}`}>
      <div className={`message-bubble ${isBot ? 'message-bot' : 'message-user'}`}>
        {isBot ? <div className="markdown-content">{formatBotText(text)}</div> : text}
        {isBot && sources.length > 0 && <div className="source-list">Sources: {sources.join(', ')}</div>}
      </div>
    </div>
  );
}