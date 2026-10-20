import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let sql = 'SELECT * FROM public.crm_contacts WHERE 1=1';
    const params: any[] = [];

    if (category) {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      sql += ` AND (LOWER(full_name) LIKE $${params.length} OR LOWER(email) LIKE $${params.length} OR LOWER(city) LIKE $${params.length})`;
    }

    sql += ' ORDER BY created_at DESC';

    const rows = await query(sql, params);
    return NextResponse.json({ success: true, data: rows });
  } catch (err: any) {
    console.error('Failed to fetch contacts:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      full_name,
      category = 'VIP Waitlist',
      email = '',
      phone = '',
      city = '',
      status = 'Active',
      notes = '',
    } = body;

    if (!full_name) {
      return NextResponse.json({ success: false, error: 'Full name is required.' }, { status: 400 });
    }

    const sql = `
      INSERT INTO public.crm_contacts
      (full_name, category, email, phone, city, status, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const params = [full_name, category, email, phone, city, status, notes];

    const rows = await query(sql, params);
    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err: any) {
    console.error('Failed to create contact:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Contact ID is required.' }, { status: 400 });
    }

    const keys = Object.keys(updates);
    if (keys.length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update.' }, { status: 400 });
    }

    const setClauses: string[] = [];
    const params: any[] = [id];

    keys.forEach((key) => {
      params.push(updates[key]);
      setClauses.push(`${key} = $${params.length}`);
    });

    const sql = `
      UPDATE public.crm_contacts
      SET ${setClauses.join(', ')}, updated_at = NOW()
      WHERE id = $1
      RETURNING *;
    `;

    const rows = await query(sql, params);
    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Contact not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err: any) {
    console.error('Failed to update contact:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required.' }, { status: 400 });
    }

    await query('DELETE FROM public.crm_contacts WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to delete contact:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
