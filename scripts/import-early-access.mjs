#!/usr/bin/env node

/**
 * Rivlet CRM — Firebase Early Access Importer
 *
 * Usage:
 *   1) From a downloaded JSON or CSV file:
 *      node scripts/import-early-access.mjs ./path/to/early-access-subscribers.json
 *      node scripts/import-early-access.mjs ./path/to/subscribers.csv
 *
 *   2) Direct from Firebase Realtime Database URL:
 *      FIREBASE_DB_URL="https://<project-id>-default-rtdb.firebaseio.com/early_access.json" node scripts/import-early-access.mjs
 *
 * Features:
 *   - Automatic field detection (name, email, phone, city, address, timestamps)
 *   - Residual fields preserved in metadata JSONB (zero data loss)
 *   - Categorized as "Early Access" (VIP Directory)
 *   - Deduplication by email (skips duplicates or updates)
 *   - Direct Supavisor Postgres pooler execution
 */

import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Pool } = pg;

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres.pmqtgqkgwmlztnmqmnag:Rivlet%401412@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0]
    .split(',')
    .map((h) => h.trim().replace(/^["']|["']$/g, '').toLowerCase());

  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
    const row = {};
    headers.forEach((header, idx) => {
      let val = values[idx] ? values[idx].trim().replace(/^["']|["']$/g, '') : '';
      row[header] = val;
    });
    records.push(row);
  }
  return records;
}

function normalize(raw) {
  let fullName = raw.full_name || raw.name || raw.fullName || raw.displayName || '';
  if (!fullName && (raw.first_name || raw.last_name)) {
    fullName = [raw.first_name, raw.last_name].filter(Boolean).join(' ').trim();
  }
  const email = (raw.email || raw.mail || '').trim().toLowerCase();
  if (!fullName && email) {
    const user = email.split('@')[0];
    fullName = user.charAt(0).toUpperCase() + user.slice(1);
  }
  if (!fullName) fullName = 'Early Access VIP';

  const phone = (raw.phone || raw.phoneNumber || raw.mobile || raw.contact || '').trim() || null;
  const city = (raw.city || raw.location || '').trim() || null;
  const fullAddress = (raw.full_address || raw.address || '').trim() || null;
  const category = (raw.category || 'Early Access').trim();
  const vipLevel = (raw.vip_level || 'Level 2').trim();
  const status = (raw.status || 'Waitlist Confirmed').trim();
  const source = (raw.source || 'Early Access App (Firebase)').trim();
  const tierColor = raw.tier_color || 'Green';
  const estimatedSpend = raw.estimated_spend || '₹0';
  const notes = raw.notes || null;

  const standardKeys = new Set([
    'full_name', 'name', 'fullName', 'displayName', 'first_name', 'last_name',
    'email', 'mail', 'phone', 'phoneNumber', 'mobile', 'contact',
    'city', 'location', 'address', 'full_address',
    'category', 'vip_level', 'tier_color', 'estimated_spend', 'status', 'source', 'notes',
    'id', 'metadata',
  ]);

  const customMetadata = { ...(raw.metadata || {}) };
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

async function loadData() {
  const filePath = process.argv[2];

  if (filePath) {
    console.log(`📁 Reading local file: ${filePath}`);
    const resolved = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(resolved)) {
      throw new Error(`File not found: ${resolved}`);
    }
    const content = fs.readFileSync(resolved, 'utf-8').trim();
    if (filePath.endsWith('.csv') || !content.startsWith('{') && !content.startsWith('[')) {
      return parseCSV(content);
    }
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) return parsed;
    // Firebase dictionary
    return Object.entries(parsed).map(([firebase_id, data]) => ({
      firebase_id,
      ...(typeof data === 'object' && data !== null ? data : { value: data }),
    }));
  }

  const rtdbUrl = process.env.FIREBASE_DB_URL;
  if (rtdbUrl) {
    console.log(`🌐 Fetching directly from Firebase URL: ${rtdbUrl}`);
    const res = await fetch(rtdbUrl);
    if (!res.ok) throw new Error(`Firebase request failed: ${res.statusText}`);
    const json = await res.json();
    if (!json) return [];
    if (Array.isArray(json)) return json;
    return Object.entries(json).map(([firebase_id, data]) => ({
      firebase_id,
      ...(typeof data === 'object' && data !== null ? data : { value: data }),
    }));
  }

  console.error(`
❌ No source provided!
Usage:
  node scripts/import-early-access.mjs <file.json or file.csv>
  or
  FIREBASE_DB_URL="https://...firebaseio.com/early_access.json" node scripts/import-early-access.mjs
`);
  process.exit(1);
}

async function main() {
  const rawList = await loadData();
  console.log(`📊 Found ${rawList.length} raw records.`);

  if (rawList.length === 0) {
    console.log('No records found to import.');
    return;
  }

  const normalized = rawList.map(normalize);

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();
  try {
    const emailsToCheck = Array.from(
      new Set(normalized.map((c) => c.email).filter(Boolean))
    );

    let existingEmails = new Set();
    if (emailsToCheck.length > 0) {
      const res = await client.query(
        'SELECT email FROM public.crm_contacts WHERE email = ANY($1::text[])',
        [emailsToCheck]
      );
      existingEmails = new Set(res.rows.map((r) => r.email.toLowerCase()));
    }

    let inserted = 0;
    let skipped = 0;
    const seen = new Set();
    const toInsert = [];

    for (const contact of normalized) {
      if (contact.email) {
        if (seen.has(contact.email) || existingEmails.has(contact.email)) {
          skipped++;
          continue;
        }
        seen.add(contact.email);
      }
      toInsert.push(contact);
    }

    console.log(`🚀 Ready to insert ${toInsert.length} new VIP early access contacts (${skipped} skipped as duplicates)...`);

    const CHUNK_SIZE = 50;
    for (let i = 0; i < toInsert.length; i += CHUNK_SIZE) {
      const chunk = toInsert.slice(i, i + CHUNK_SIZE);
      const placeholders = [];
      const params = [];

      chunk.forEach((c) => {
        const s = params.length + 1;
        placeholders.push(
          `($${s}, $${s + 1}, $${s + 2}, $${s + 3}, $${s + 4}, $${s + 5}, $${s + 6}, $${s + 7}, $${s + 8}, $${s + 9}, $${s + 10}, $${s + 11}, $${s + 12})`
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
        VALUES ${placeholders.join(', ')}
        RETURNING id;
      `;
      const result = await client.query(sql, params);
      inserted += result.rows.length;
    }

    console.log(`\n🎉 Success!`);
    console.log(`   - Total Inserted into VIP Directory: ${inserted}`);
    console.log(`   - Skipped duplicates: ${skipped}`);
    console.log(`   - Category: Early Access`);
    console.log(`   - Directory: VIP Directory (crm_contacts)`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('❌ Import failed:', err);
  process.exit(1);
});
