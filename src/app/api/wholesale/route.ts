import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage');
    const search = searchParams.get('search');

    let sql = 'SELECT * FROM public.wholesale_accounts WHERE 1=1';
    const params: any[] = [];

    if (stage) {
      params.push(stage);
      sql += ` AND stage = $${params.length}`;
    }

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      sql += ` AND (LOWER(business_name) LIKE $${params.length} OR LOWER(contact_name) LIKE $${params.length} OR LOWER(location) LIKE $${params.length})`;
    }

    sql += ' ORDER BY created_at DESC';

    const rows = await query(sql, params);
    return NextResponse.json({ success: true, data: rows });
  } catch (err: any) {
    console.error('Failed to fetch wholesale accounts:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      business_name,
      account_type = 'Pilates Studio',
      location,
      contact_name,
      contact_email,
      contact_phone = '',
      stage = 'lead_pitch',
      estimated_order_value = 0,
      target_delivery_date = null,
      notes = '',
    } = body;

    if (!business_name || !contact_name || !contact_email) {
      return NextResponse.json({ success: false, error: 'Business name, contact name, and email are required.' }, { status: 400 });
    }

    const sql = `
      INSERT INTO public.wholesale_accounts
      (business_name, account_type, location, contact_name, contact_email, contact_phone, stage, estimated_order_value, target_delivery_date, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const params = [
      business_name,
      account_type,
      location,
      contact_name,
      contact_email,
      contact_phone,
      stage,
      estimated_order_value,
      target_delivery_date,
      notes,
    ];

    const rows = await query(sql, params);
    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err: any) {
    console.error('Failed to create wholesale account:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Account ID is required.' }, { status: 400 });
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
      UPDATE public.wholesale_accounts
      SET ${setClauses.join(', ')}, updated_at = NOW()
      WHERE id = $1
      RETURNING *;
    `;

    const rows = await query(sql, params);
    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Account not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err: any) {
    console.error('Failed to update wholesale account:', err);
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

    await query('DELETE FROM public.wholesale_accounts WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to delete wholesale account:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
