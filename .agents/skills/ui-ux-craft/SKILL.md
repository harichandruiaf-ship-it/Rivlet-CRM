---
name: ui-ux-craft
description: >-
  Elite UI/UX design engineering and frontend craft skill. Use whenever designing,
  refining, or reviewing user interfaces to ensure neat, clean, minimalist, and
  enterprise-grade professional aesthetics inspired by Linear, Raycast, Vercel, and Stripe.
---

# UI/UX Craft & Frontend Design Engineering Skill

This skill governs the visual design, interactive polish, and user experience standards for all frontend code generated in this workspace.

---

## 1. Core Visual Philosophy: "Clean, Neat & Professional"

Great UI design is defined by **restraint, precision, and clarity**, not decorative noise:
1. **Content First, Chrome Second**: Subtle 1px borders (`border-zinc-200` in light, `border-zinc-800` in dark) instead of heavy dropped shadows.
2. **Predictable 4px/8px Spatial Rhythm**: All padding, margins, and gaps adhere to multiples of 4px (`p-2`, `p-3`, `p-4`, `p-6`). Never use random arbitrary pixel values.
3. **Restrained Color Palette**:
   - 90% Neutral Grayscale: Zinc/Slate surfaces, text, and borders.
   - 10% Intentional Accent: Single primary brand accent (e.g., `#18181b` with subtle blue/indigo highlights).
   - Semantic Status Badges: Soft pastel backgrounds with dark, readable text (e.g., emerald-50/700 for active, amber-50/700 for pending, indigo-50/700 for shipped).
4. **Typography Discipline**:
   - Primary typeface: `Inter`, `Geist`, or `-apple-system`.
   - Restrict font sizes: 10px (micro badges/dates), 11px (captions/labels), 12px (table cells/inputs), 14px (headings/subtitles), 16px (page titles).
   - Maximum 2 font weights on any single screen (Regular `400` and Semibold `600`). Avoid heavy bold `800+` text.

---

## 2. Interactive States & Micro-Interactions

Every interactive element must provide feedback across all 6 interaction states:
- **Default**: Crisp border, muted background, clear label.
- **Hover**: Subtle background lift (`hover:bg-zinc-50` or `hover:border-zinc-400`), 150ms smooth transition (`transition-colors duration-150`).
- **Active / Pressed**: Subtle scale or darker background (`active:scale-[0.99]`).
- **Focus-Visible**: High-contrast, accessible ring (`focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:outline-none`).
- **Disabled**: Reduced opacity (`opacity-50 cursor-not-allowed pointer-events-none`).
- **Loading / Skeleton**: Smooth pulse shimmer, never blank empty voids.

---

## 3. High-Productivity SaaS UX Patterns

1. **Slide-Over Detail Sheets (Drawers)**:
   - Clicking a record should open a right-hand slide-over sheet without tearing down the background view.
   - Always closeable via `Escape` key, backdrop click, or `X` button.
2. **Dense, Virtual-Ready Data Tables**:
   - Sticky headers with uppercase tracking labels (`text-[11px] font-semibold text-zinc-500 uppercase tracking-wider`).
   - Monospace font for numerical, SKU, sizing, and date values (`font-mono`).
   - Quick search input with shortcut hint (`⌘K` or `/`).
3. **Smooth Kanban Boards**:
   - Clear column count pill indicators.
   - Visual ghost or ring indicator when dragging over a drop target column.
   - Zero-lag optimistic UI updates.
4. **Empty States**:
   - Never show a blank container. Always provide an icon, brief explanation, and primary action button (e.g. `+ Add First Creator`).

---

## 4. UI/UX Pre-Ship Checklist

Before finalizing any frontend interface, verify:
- [ ] Is the spacing consistent across all cards and sections (multiples of 4/8px)?
- [ ] Are font sizes restrained and readable at arms length?
- [ ] Do all buttons and links have hover and focus-visible states?
- [ ] Does the screen look clean, uncluttered, and enterprise-grade?
- [ ] Is keyboard navigation supported (`Tab`, `Esc`, `⌘K`)?
