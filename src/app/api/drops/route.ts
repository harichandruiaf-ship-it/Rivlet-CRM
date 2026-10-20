import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const rows = await query('SELECT * FROM public.drops ORDER BY created_at ASC');
    return NextResponse.json({ success: true, data: rows });
  } catch (err: any) {
    console.error('Failed to fetch drops:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description = '', status = 'active', target_date = null } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Drop name is required.' }, { status: 400 });
    }

    const sql = `
      INSERT INTO public.drops (name, description, status, target_date)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (name) DO UPDATE SET
        description = EXCLUDED.description,
        status = EXCLUDED.status,
        updated_at = NOW()
      RETURNING *;
    `;
    const rows = await query(sql, [name.trim(), description, status, target_date]);
    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err: any) {
    console.error('Failed to create drop:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
