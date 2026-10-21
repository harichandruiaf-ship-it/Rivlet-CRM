'use client';

import React, { useState, useMemo } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, ArrowRight, Loader2, Database, ShieldAlert } from 'lucide-react';
import { ContactCategory, VIPLevel } from '@/lib/types';

interface ImportEarlyAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

export default function ImportEarlyAccessModal({
  isOpen,
  onClose,
  onSuccess,
}: ImportEarlyAccessModalProps) {
  const [tab, setTab] = useState<'upload' | 'paste'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [category, setCategory] = useState<ContactCategory>('Early Access');
  const [vipLevel, setVipLevel] = useState<VIPLevel>('Level 2');
  const [source, setSource] = useState('Early Access App (Firebase)');
  const [onConflict, setOnConflict] = useState<'skip' | 'update'>('skip');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper parser for CSV
  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return [];

    const headers = lines[0]
      .split(',')
      .map((h) => h.trim().replace(/^["']|["']$/g, '').toLowerCase());

    const result: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      // Basic CSV regex to handle commas inside quotes
      const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
      const row: Record<string, any> = {};
      headers.forEach((header, idx) => {
        let val = values[idx] ? values[idx].trim().replace(/^["']|["']$/g, '') : '';
        row[header] = val;
      });
      result.push(row);
    }
    return result;
  };

  // Live parsed records
  const parsedRecords = useMemo(() => {
    setError(null);
    const content = rawText.trim();
    if (!content) return [];

    try {
      if (content.startsWith('{') || content.startsWith('[')) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          return parsed;
        } else if (typeof parsed === 'object' && parsed !== null) {
          // If it's a Firebase Realtime DB dictionary keyed by push IDs
          return Object.entries(parsed).map(([firebaseId, data]) => {
            if (typeof data === 'object' && data !== null) {
              return { firebase_id: firebaseId, ...data };
            }
            return { firebase_id: firebaseId, value: data };
          });
        }
      } else {
        // Attempt CSV parse
        return parseCSV(content);
      }
    } catch (err: any) {
      setError('Unable to parse JSON/CSV: ' + err.message);
      return [];
    }
    return [];
  }, [rawText]);

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawText(text);
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (parsedRecords.length === 0) {
      setError('No valid contacts to import. Please supply valid JSON or CSV data.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/contacts/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contacts: parsedRecords,
          defaultCategory: category,
          defaultVipLevel: vipLevel,
          defaultSource: source,
          onConflict,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Import failed');
      }

      onSuccess(data.data.inserted + data.data.updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred during import.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#e4e4e7] rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between shrink-0 bg-[#fafafa]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-zinc-900 text-white rounded-lg">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">
                Import Early Access to VIP Directory
              </h2>
              <p className="text-[11px] text-zinc-500 font-medium">
                Extract from Firebase or early testing database directly into your VIP waitlist
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Method Tabs */}
          <div className="flex items-center bg-zinc-100 p-1 rounded-lg w-fit border border-zinc-200/60">
            <button
              type="button"
              onClick={() => setTab('upload')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                tab === 'upload'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload JSON / CSV File</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('paste')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                tab === 'paste'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste Raw JSON / Text</span>
            </button>
          </div>

          {/* Tab 1: Upload */}
          {tab === 'upload' && (
            <div className="border-2 border-dashed border-zinc-200 rounded-xl p-6 text-center hover:border-zinc-400 transition-colors bg-[#fbfbfb]">
              <input
                type="file"
                id="firebase-file"
                accept=".json,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="firebase-file"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-800 text-xs">
                    {file ? file.name : 'Choose exported Firebase .json or .csv'}
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Supports Firebase Realtime DB exports, Firestore collections, or CSV
                  </p>
                </div>
                <span className="mt-1 px-3 py-1 bg-white border border-zinc-200 text-zinc-700 font-medium rounded-md hover:bg-zinc-50 shadow-2xs">
                  {file ? 'Change file' : 'Browse computer'}
                </span>
              </label>
            </div>
          )}

          {/* Tab 2: Paste JSON */}
          {tab === 'paste' && (
            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                Paste JSON Array or Firebase Dictionary:
              </label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder='[{"email": "early@rivlet.com", "name": "Aarav Shah", "phone": "+919876543210"}]'
                rows={6}
                className="w-full font-mono text-[11px] p-3 bg-[#fbfbfb] border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 text-zinc-800 resize-none"
              />
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Configuration Settings */}
          <div className="bg-[#fafafa] p-3.5 border border-zinc-200/80 rounded-xl space-y-3">
            <h3 className="text-[11px] font-semibold text-zinc-800 uppercase tracking-wider">
              Import Configuration
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                  Directory Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ContactCategory)}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900"
                >
                  <option value="Early Access">Early Access</option>
                  <option value="VIP Waitlist">VIP Waitlist</option>
                  <option value="Community Leader">Community Leader</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                  Assigned VIP Tier
                </label>
                <select
                  value={vipLevel}
                  onChange={(e) => setVipLevel(e.target.value as VIPLevel)}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900"
                >
                  <option value="Level 1">Level 1 (Highest Purchase Power)</option>
                  <option value="Level 2">Level 2 (High Potential)</option>
                  <option value="Level 3">Level 3 (General VIP)</option>
                  <option value="Level 4">Level 4 (Standard Waitlist)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                  Duplicate Email Rule
                </label>
                <select
                  value={onConflict}
                  onChange={(e) => setOnConflict(e.target.value as 'skip' | 'update')}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900"
                >
                  <option value="skip">Skip if email exists</option>
                  <option value="update">Update existing contact</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                Source Attribution Tag
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                placeholder="e.g. Early Access App (Firebase)"
              />
            </div>
          </div>

          {/* Live Preview Section */}
          {parsedRecords.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{parsedRecords.length} subscribers detected</span>
                </span>
                <span className="text-[11px] text-zinc-400">
                  Showing first {Math.min(3, parsedRecords.length)} preview rows
                </span>
              </div>

              <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-[#fafafa] border-b border-zinc-200/80 text-zinc-500 font-medium">
                    <tr>
                      <th className="py-1.5 px-3">Name</th>
                      <th className="py-1.5 px-3">Email</th>
                      <th className="py-1.5 px-3">Phone</th>
                      <th className="py-1.5 px-3">Location / City</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {parsedRecords.slice(0, 3).map((row, idx) => {
                      const name =
                        row.full_name ||
                        row.name ||
                        row.fullName ||
                        row.displayName ||
                        (row.email ? row.email.split('@')[0] : 'Early Access VIP');
                      const email = row.email || row.mail || '-';
                      const phone = row.phone || row.phoneNumber || row.mobile || '-';
                      const city = row.city || row.location || '-';

                      return (
                        <tr key={idx} className="hover:bg-zinc-50">
                          <td className="py-1.5 px-3 font-semibold text-zinc-900">{name}</td>
                          <td className="py-1.5 px-3 text-zinc-600 font-mono text-[10px]">{email}</td>
                          <td className="py-1.5 px-3 text-zinc-600 font-mono text-[10px]">{phone}</td>
                          <td className="py-1.5 px-3 text-zinc-600">{city}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-zinc-100 bg-[#fafafa] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 rounded-md transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleImport}
            disabled={isSubmitting || parsedRecords.length === 0}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#18181b] hover:bg-[#27272a] disabled:bg-zinc-300 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-md shadow-xs transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Importing to VIP Directory...</span>
              </>
            ) : (
              <>
                <span>
                  Import {parsedRecords.length > 0 ? `${parsedRecords.length} Contacts` : 'to VIP'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
