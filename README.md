# 🤖 AsstBot – AI Assistant with RAG

AsstBot is an AI-powered assistant built with **Next.js and React** for general conversations, planning, and document-based question answering.

The application provides two modes:

- 💬 **Chat Mode** – Ask general questions and interact with the AI assistant.
- 📚 **RAG Workspace** – Upload documents and ask questions based on their content using Retrieval-Augmented Generation (RAG).

## 🚀 Live Demo

**[Open AsstBot](https://asstbot-project.vercel.app)**

## 📂 GitHub Repository

**[View Source Code](https://github.com/Guptha916/AsstBot-project)**

---

## ✨ Features

- 💬 AI-powered conversational chat
- 📚 Document-based question answering using RAG
- 📄 Upload multiple documents for knowledge-based conversations
- 🔍 Semantic retrieval of relevant document content
- 📝 Document summarization
- 🗂️ View indexed document information and source filenames
- 🧠 Uses recent conversation history to maintain context
- 🖥️ Markdown-based assistant responses with headings, lists, links, code, and blockquotes
- 🌙 Dark and light theme support
- 🧹 Clear the current conversation
- ⚡ Next.js App Router with server-side API routes
- 🔐 Secure API key configuration using environment variables
- ☁️ Deployed on Vercel

---

## 🛠️ Tech Stack

| Layer | Technologies |
| --- | --- |
| Framework | Next.js 16.3.1 |
| UI | React 19.2.8, TypeScript 5 |
| Styling | CSS Modules, Tailwind CSS 4 |
| AI | Cohere API |
| Document Processing | pdf-parse, mammoth |
| RAG | Cohere embeddings, cosine similarity, in-memory retrieval |
| Fonts | Geist and Geist Mono |
| Deployment | Vercel |

---

## 🏗️ Architecture

```text
app/
├── api/
│   ├── chat/
│   │   └── route.js          # Chat and RAG response endpoint
│   └── documents/
│       └── route.js          # Document upload and management
│
├── components/
│   ├── ChatComposer.tsx      # Message input and keyboard behavior
│   ├── ChatMessage.tsx       # User and assistant message rendering
│   ├── KnowledgeBase.tsx     # Document upload and indexing controls
│   └── ModeToggle.tsx        # Chat/RAG mode switcher
│
├── globals.css               # Global styles
├── layout.tsx                # Root layout, metadata, and fonts
├── page.module.css           # Main interface styles
└── page.tsx                  # Main application workflow
│
lib/
└── rag.js                    # Document extraction, chunking,
                              # embeddings, and retrieval

next.config.ts                # Next.js configuration
postcss.config.mjs            # PostCSS configuration
tsconfig.json                 # TypeScript configuration
```

---

## 💬 How Normal Chat Works

1. User selects **Chat** mode and enters a message.
2. The client sends the message and conversation history to `POST /api/chat`.
3. The server validates and processes the request.
4. Recent conversation messages are provided as context.
5. Cohere generates the AI response.
6. The response is displayed in the chat interface.

---

## 📚 How RAG Works

**RAG (Retrieval-Augmented Generation)** allows the assistant to answer questions using information from uploaded documents.

### 📄 Document Upload Flow

1. User switches to **RAG Workspace** mode.
2. User uploads one or more supported documents.
3. `POST /api/documents` extracts and cleans the document text.
4. The text is divided into overlapping chunks.
5. Each chunk is converted into an embedding using Cohere.
6. The chunks and embeddings are stored in an in-memory knowledge base.

### 🔍 Question Answering Flow

1. User asks a question about the uploaded documents.
2. The question is converted into an embedding.
3. The application calculates cosine similarity against stored document chunks.
4. The most relevant chunks are retrieved.
5. Retrieved content is provided to Cohere as source context.
6. The AI generates an answer based on the retrieved content.
7. Relevant source filenames are returned and displayed in the UI.

---

## 📄 Supported Documents

The application currently supports:

- PDF
- DOCX
- TXT
- Markdown
- CSV
- JSON
- HTML
- XML

### Current Limits

- 📦 Maximum file size: **10 MB per file**
- 📁 Maximum files per upload: **5**
- 📝 Maximum extracted content: **1 million characters per file**
- 💾 Document storage: **In-memory**

> **Note:** The knowledge base is stored in memory and is cleared when the server instance restarts or is replaced. It is not currently backed by a persistent database.

---

## 🔌 API Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/chat` | Generates AI responses for Chat and RAG modes |
| `GET` | `/api/documents` | Returns indexed document metadata |
| `POST` | `/api/documents` | Uploads, processes, embeds, and indexes documents |
| `DELETE` | `/api/documents` | Clears the in-memory document store |

---

## ⚙️ Run the Project Locally

### Prerequisites

- Node.js
- npm
- Cohere API key

### 1. Clone the repository

```bash
git clone https://github.com/Guptha916/AsstBot-project.git
cd AsstBot-project
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
COHERE_API_KEY=your_cohere_api_key
```

If you want to override the default embedding model, you can also configure:

```env
COHERE_EMBED_MODEL=embed-english-v3.0
```

> ⚠️ Never commit `.env.local` or expose API keys publicly.

### 4. Start the development server

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

### Available Commands

```bash
npm run dev      # Start development server
npm run build    # Create production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## ☁️ Deployment

The application is deployed using **Vercel**.

🌐 **Live Application:**  
[https://asstbot-project.vercel.app](https://asstbot-project.vercel.app)

To deploy your own instance:

1. Import the GitHub repository into Vercel.
2. Select **Next.js** as the framework.
3. Use the project root containing `package.json`.
4. Add `COHERE_API_KEY` as a Vercel environment variable.
5. Deploy the application.

---

## 🔮 Future Improvements

Potential improvements include:

- 💾 Persistent document storage
- 👤 User authentication
- 💬 Persistent conversation history
- 🔎 Improved retrieval and ranking
- ⚡ Streaming AI responses
- 📑 Additional document formats
- 🗄️ Vector database integration

---

## 👨‍💻 Author

**Guptha916**

- 🔗 [GitHub Repository](https://github.com/Guptha916/AsstBot-project)
- 🚀 [Live Demo](https://asstbot-project.vercel.app)
