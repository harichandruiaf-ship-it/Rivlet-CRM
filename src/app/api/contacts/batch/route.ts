import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface RawImportContact {
  full_name?: string;
  name?: string;
  fullName?: string;
  displayName?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  mail?: string;
  phone?: string;
  phoneNumber?: string;
  mobile?: string;
  contact?: string;
  city?: string;
  location?: string;
  address?: string;
  full_address?: string;
  category?: string;
  vip_level?: string;
  tier_color?: string;
  estimated_spend?: string;
  status?: string;
  source?: string;
  notes?: string;
  metadata?: Record<string, any>;
  [key: string]: any;
}

function normalizeContact(raw: RawImportContact, defaults: {
  category: string;
  vip_level: string;
  status: string;
  source: string;
}) {
  // Extract or synthesize name
  let fullName = raw.full_name || raw.name || raw.fullName || raw.displayName || '';
  if (!fullName && (raw.first_name || raw.last_name)) {
    fullName = [raw.first_name, raw.last_name].filter(Boolean).join(' ').trim();
  }
  const email = (raw.email || raw.mail || '').trim().toLowerCase();
  if (!fullName && email) {
    const username = email.split('@')[0];
    fullName = username.charAt(0).toUpperCase() + username.slice(1);
  }
  if (!fullName) {
    fullName = 'Early Access VIP';
  }

  const phone = (raw.phone || raw.phoneNumber || raw.mobile || raw.contact || '').trim() || null;
  const city = (raw.city || raw.location || '').trim() || null;
  const fullAddress = (raw.full_address || raw.address || '').trim() || null;
  const category = (raw.category || defaults.category || 'Early Access').trim();
  const vipLevel = (raw.vip_level || defaults.vip_level || 'Level 2').trim();
  const status = (raw.status || defaults.status || 'Waitlist Confirmed').trim();
  const source = (raw.source || defaults.source || 'Early Access App (Firebase)').trim();
  const tierColor = raw.tier_color || 'Green';
  const estimatedSpend = raw.estimated_spend || '₹0';
  const notes = raw.notes || null;

  // Collect all residual fields into metadata so no Firebase details are lost
  const standardKeys = new Set([
    'full_name', 'name', 'fullName', 'displayName', 'first_name', 'last_name',
    'email', 'mail', 'phone', 'phoneNumber', 'mobile', 'contact',
    'city', 'location', 'address', 'full_address',
    'category', 'vip_level', 'tier_color', 'estimated_spend', 'status', 'source', 'notes',
    'id', 'metadata',
  ]);

  const customMetadata: Record<string, any> = {
    ...(raw.metadata || {}),
  };

  for (const [key, value] of Object.entries(raw)) {
    if (!standardKeys.has(key) && value !== undefined && value !== null) {
      customMetadata[key] = value;
    }
  }

  return {
    full_name: fullName,
    email: email || null,
    phone,
    city,
    full_address: fullAddress,
    category,
    vip_level: vipLevel,
    tier_color: tierColor,
    estimated_spend: estimatedSpend,
    status,
    source,
    notes,
    metadata: Object.keys(customMetadata).length > 0 ? customMetadata : null,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      contacts = [],
      defaultCategory = 'Early Access',
      defaultVipLevel = 'Level 2',
      defaultStatus = 'Waitlist Confirmed',
      defaultSource = 'Early Access App (Firebase)',
      onConflict = 'skip', // 'skip' | 'update'
    } = body;

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No contacts provided in request body.' },
        { status: 400 }
      );
    }

    const defaults = {
      category: defaultCategory,
      vip_level: defaultVipLevel,
      status: defaultStatus,
      source: defaultSource,
    };

    const normalized = contacts.map((c) => normalizeContact(c, defaults));

    // Gather distinct emails that are non-null
    const emailsToCheck = Array.from(
      new Set(normalized.map((c) => c.email).filter(Boolean) as string[])
    );

    let existingEmailMap = new Map<string, string>(); // email -> contact id
    if (emailsToCheck.length > 0) {
      const existingRows = await query(
        'SELECT id, email FROM public.crm_contacts WHERE email = ANY($1::text[])',
        [emailsToCheck]
      );
      for (const row of existingRows) {
        if (row.email) {
          existingEmailMap.set(row.email.toLowerCase(), row.id);
        }
      }
    }

    let insertedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    const toInsert: typeof normalized = [];
    const seenInBatch = new Set<string>();

    for (const contact of normalized) {
      const email = contact.email;
      if (email && seenInBatch.has(email)) {
        skippedCount++;
        continue;
      }
      if (email) {
        seenInBatch.add(email);
      }

      if (email && existingEmailMap.has(email)) {
        const existingId = existingEmailMap.get(email)!;
        if (onConflict === 'update') {
          await query(
            `UPDATE public.crm_contacts 
             SET full_name = COALESCE($1, full_name),
                 phone = COALESCE($2, phone),
                 city = COALESCE($3, city),
                 category = $4,
                 source = $5,
                 vip_level = $6,
                 status = $7,
                 metadata = COALESCE(crm_contacts.metadata, '{}'::jsonb) || COALESCE($8::jsonb, '{}'::jsonb),
                 updated_at = NOW()
             WHERE id = $9`,
            [
              contact.full_name,
              contact.phone,
              contact.city,
              contact.category,
              contact.source,
              contact.vip_level,
              contact.status,
              contact.metadata ? JSON.stringify(contact.metadata) : null,
              existingId,
            ]
          );
          updatedCount++;
        } else {
          skippedCount++;
        }
      } else {
        toInsert.push(contact);
      }
    }

    // Batch insert new records in chunks of 50 to prevent parameter limit issues
    const CHUNK_SIZE = 50;
    for (let i = 0; i < toInsert.length; i += CHUNK_SIZE) {
      const chunk = toInsert.slice(i, i + CHUNK_SIZE);
      const valuePlaceholders: string[] = [];
      const params: any[] = [];

      chunk.forEach((c) => {
        const start = params.length + 1;
        valuePlaceholders.push(
          `($${start}, $${start + 1}, $${start + 2}, $${start + 3}, $${start + 4}, $${start + 5}, $${start + 6}, $${start + 7}, $${start + 8}, $${start + 9}, $${start + 10}, $${start + 11}, $${start + 12})`
        );
        params.push(
          c.full_name,
          c.category,
          c.email,
          c.phone,
          c.city,
          c.full_address,
          c.source,
          c.vip_level,
          c.tier_color,
          c.estimated_spend,
          c.status,
          c.notes,
          c.metadata ? JSON.stringify(c.metadata) : null
        );
      });

      const sql = `
        INSERT INTO public.crm_contacts
        (full_name, category, email, phone, city, full_address, source, vip_level, tier_color, estimated_spend, status, notes, metadata)
        VALUES ${valuePlaceholders.join(', ')}
        RETURNING id;
      `;

      const res = await query(sql, params);
      insertedCount += res.length;
    }

    return NextResponse.json({
      success: true,
      data: {
        totalReceived: contacts.length,
        inserted: insertedCount,
        updated: updatedCount,
        skipped: skippedCount,
      },
    });
  } catch (err: any) {
    console.error('Failed to batch import contacts:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to batch import contacts' },
      { status: 500 }
    );
  }
}
