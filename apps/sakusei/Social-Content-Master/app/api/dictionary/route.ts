import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// Temporary: No user ID until auth is implemented (userId is optional in schema)
const DEFAULT_USER_ID: string | null = null;

/**
 * GET /api/dictionary - Get all dictionary entries for user
 */
export async function GET() {
  try {
    const entries = await db.transcriptionDictionary.findMany({
      where: { userId: DEFAULT_USER_ID },
      orderBy: { term: 'asc' },
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('[Dictionary API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dictionary' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/dictionary - Add new dictionary entry
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { term, replacement, caseSensitive = false } = body;

    if (!term || !replacement) {
      return NextResponse.json(
        { error: 'Term and replacement are required' },
        { status: 400 }
      );
    }

    // Check if term already exists
    const existing = await db.transcriptionDictionary.findUnique({
      where: {
        userId_term: {
          userId: DEFAULT_USER_ID,
          term: term.trim(),
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Ce terme existe déjà dans le dictionnaire' },
        { status: 409 }
      );
    }

    const entry = await db.transcriptionDictionary.create({
      data: {
        userId: DEFAULT_USER_ID,
        term: term.trim(),
        replacement: replacement.trim(),
        caseSensitive,
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error('[Dictionary API] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create dictionary entry' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/dictionary - Delete dictionary entry
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    await db.transcriptionDictionary.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Dictionary API] DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete dictionary entry' },
      { status: 500 }
    );
  }
}
