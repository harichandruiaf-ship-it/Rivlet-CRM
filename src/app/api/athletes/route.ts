import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage');
    const niche = searchParams.get('niche');
    const search = searchParams.get('search');

    let sql = 'SELECT * FROM public.athletes_creators WHERE 1=1';
    const params: any[] = [];

    if (stage) {
      params.push(stage);
      sql += ` AND stage = $${params.length}`;
    }

    if (niche) {
      params.push(niche);
      sql += ` AND niche = $${params.length}`;
    }

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      sql += ` AND (LOWER(full_name) LIKE $${params.length} OR LOWER(handle) LIKE $${params.length} OR LOWER(niche) LIKE $${params.length})`;
    }

    sql += ' ORDER BY created_at DESC';

    const rows = await query(sql, params);
    return NextResponse.json({ success: true, data: rows });
  } catch (err: any) {
    console.error('Failed to fetch athletes:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      full_name,
      handle,
      platform = 'Instagram',
      niche = 'Pilates',
      follower_tier = 'Micro (10k-50k)',
      top_size = 'S',
      sports_bra_size = '34B',
      bottom_size = 'S',
      inseam_length = '25"',
      preferred_colors = 'Midnight Black',
      stage = 'scouted',
      target_drop = 'Drop 1',
      shipping_address = '',
      phone = '',
      email = '',
      tracking_number = '',
      courier_partner = 'Blue Dart',
      post_url = '',
      discount_code = '',
      notes = '',
    } = body;

    if (!full_name || !handle) {
      return NextResponse.json({ success: false, error: 'Full name and handle are required.' }, { status: 400 });
    }

    const sql = `
      INSERT INTO public.athletes_creators
      (full_name, handle, platform, niche, follower_tier, top_size, sports_bra_size, bottom_size, inseam_length, preferred_colors, stage, target_drop, shipping_address, phone, email, tracking_number, courier_partner, post_url, discount_code, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *;
    `;
    const params = [
      full_name,
      handle,
      platform,
      niche,
      follower_tier,
      top_size,
      sports_bra_size,
      bottom_size,
      inseam_length,
      preferred_colors,
      stage,
      target_drop,
      shipping_address,
      phone,
      email,
      tracking_number,
      courier_partner,
      post_url,
      discount_code,
      notes,
    ];

    const rows = await query(sql, params);
    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err: any) {
    console.error('Failed to create athlete:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Athlete ID is required.' }, { status: 400 });
    }

    // Exclude system keys that should not be directly assigned in SET
    const validKeys = Object.keys(updates).filter(
      (k) => !['id', 'created_at', 'updated_at'].includes(k)
    );

    if (validKeys.length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update.' }, { status: 400 });
    }

    const setClauses: string[] = [];
    const params: any[] = [id];

    validKeys.forEach((key) => {
      params.push(updates[key]);
      setClauses.push(`${key} = $${params.length}`);
    });

    const sql = `
      UPDATE public.athletes_creators
      SET ${setClauses.join(', ')}, updated_at = NOW()
      WHERE id = $1
      RETURNING *;
    `;

    const rows = await query(sql, params);
    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Athlete not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err: any) {
    console.error('Failed to update athlete:', err);
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

    await query('DELETE FROM public.athletes_creators WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to delete athlete:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
