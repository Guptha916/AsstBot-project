import { NextResponse } from 'next/server';
import { clearDocuments, ingestFiles, listDocuments } from '@/lib/rag';

export const runtime = 'nodejs';

export async function GET() { return NextResponse.json({ documents: listDocuments() }); }

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files').filter((value) => value instanceof File);
    return NextResponse.json({ documents: await ingestFiles(files) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not process files.' }, { status: 400 });
  }
}

export async function DELETE() { clearDocuments(); return NextResponse.json({ documents: [] }); }