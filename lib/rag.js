import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';
import { CohereClient } from 'cohere-ai';

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_DOCUMENT_CHARS = 1_000_000;
const CHUNK_SIZE = 450;
const CHUNK_OVERLAP = 75;
const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });
const store = globalThis.__ragStore || { chunks: [], documents: new Map() };
globalThis.__ragStore = store;

function cleanText(text) {
  return text.replace(/\u0000/g, '').replace(/\r/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

function chunkText(text, fileName) {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks = [];
  for (let start = 0; start < words.length; start += CHUNK_SIZE - CHUNK_OVERLAP) {
    const content = words.slice(start, start + CHUNK_SIZE).join(' ').trim();
    if (content.length >= 40) chunks.push({ content, fileName });
    if (start + CHUNK_SIZE >= words.length) break;
  }
  return chunks;
}

async function extractText(file) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = file.name.toLowerCase().split('.').pop();
  if (buffer.length > MAX_FILE_BYTES) throw new Error(`${file.name} is larger than 10 MB.`);
  if (extension === 'pdf') return (await pdfParse(buffer)).text;
  if (extension === 'docx') return (await mammoth.extractRawText({ buffer })).value;
  if (['txt', 'md', 'csv', 'json', 'html', 'xml'].includes(extension)) return buffer.toString('utf8');
  throw new Error(`${file.name} is not supported. Use PDF, DOCX, TXT, MD, CSV, JSON, HTML, or XML.`);
}

function embeddingValues(response) {
  return response.embeddings?.float || response.embeddings || [];
}

async function embed(texts, inputType) {
  if (!process.env.COHERE_API_KEY) throw new Error('COHERE_API_KEY is not configured.');
  const response = await cohere.embed({ texts, model: process.env.COHERE_EMBED_MODEL || 'embed-english-v3.0', inputType, embeddingTypes: ['float'] });
  return embeddingValues(response);
}

function cosineSimilarity(left, right) {
  let dot = 0; let leftMagnitude = 0; let rightMagnitude = 0;
  for (let index = 0; index < left.length; index += 1) { dot += left[index] * right[index]; leftMagnitude += left[index] ** 2; rightMagnitude += right[index] ** 2; }
  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude) || 1);
}

export async function ingestFiles(files) {
  if (files.length === 0 || files.length > 5) throw new Error('Upload between 1 and 5 files.');
  const pending = [];
  for (const file of files) {
    const text = cleanText(await extractText(file));
    if (!text) throw new Error(`${file.name} does not contain readable text.`);
    if (text.length > MAX_DOCUMENT_CHARS) throw new Error(`${file.name} contains more than 1 million characters.`);
    pending.push({ fileName: file.name, chunks: chunkText(text, file.name) });
  }
  const vectors = await embed(pending.flatMap((item) => item.chunks.map((chunk) => chunk.content)), 'search_document');
  let vectorIndex = 0;
  for (const item of pending) {
    store.chunks = store.chunks.filter((chunk) => chunk.fileName !== item.fileName);
    const documentChunks = item.chunks.map((chunk) => ({ ...chunk, vector: vectors[vectorIndex++] }));
    store.chunks.push(...documentChunks);
    store.documents.set(item.fileName, { fileName: item.fileName, chunks: documentChunks.length, characters: documentChunks.reduce((total, chunk) => total + chunk.content.length, 0) });
  }
  return listDocuments();
}

export function listDocuments() { return Array.from(store.documents.values()); }
export function clearDocuments() { store.chunks = []; store.documents.clear(); }

export async function retrieve(query, limit = 5) {
  if (!store.chunks.length) return [];
  const [queryVector] = await embed([query], 'search_query');
  return store.chunks.map((chunk) => ({ ...chunk, score: cosineSimilarity(queryVector, chunk.vector) })).sort((left, right) => right.score - left.score).slice(0, limit).filter((chunk) => chunk.score >= 0.2);
}