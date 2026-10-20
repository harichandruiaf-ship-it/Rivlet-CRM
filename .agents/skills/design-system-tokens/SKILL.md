---
name: design-system-tokens
description: >-
  Systematic design tokens, component architecture, and design system governance.
  Use when defining color palettes, border radii, typography hierarchies, and
  reusable component abstractions across the application.
---

# Design System Tokens & Component Governance

This skill provides the architectural tokens and component standards to keep the design system cohesive, scalable, and maintainable.

---

## 1. Semantic Token Architecture

Always map styles to semantic tokens rather than raw hex values or arbitrary ad-hoc classes:

```css
/* Backgrounds */
--crm-bg: #fbfbfb;          /* Canvas background */
--crm-surface: #ffffff;     /* Card and modal surfaces */
--crm-subtle: #f4f4f5;      /* Inactive tabs, column backgrounds */

/* Borders */
--crm-border: #e4e4e7;      /* Clean 1px structural separators */
--crm-border-hover: #a1a1aa;/* Interactive element hover border */

/* Text & Typography */
--crm-text: #09090b;        /* High-contrast primary copy */
--crm-muted: #71717a;       /* Secondary labels, helper text */
--crm-dim: #a1a1aa;         /* Placeholders and disabled labels */

/* Accents & Brand */
--crm-primary: #18181b;     /* Primary buttons, key brand marks */
--crm-accent: #2563eb;      /* Active selection, link hovers */
```

---

## 2. Component Design Standards

### 1. Buttons & Badges
- **Primary Button**: `bg-[#18181b] hover:bg-[#27272a] text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-subtle transition-colors`
- **Secondary / Ghost Button**: `bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-medium px-3 py-1.5 rounded-md transition-colors`
- **Status Pills**: `text-[10px] font-medium px-2 py-0.5 rounded-full border` (e.g. `bg-emerald-50 text-emerald-800 border-emerald-200`)

### 2. Form Inputs & Selects
- Inputs must use: `bg-[#fbfbfb] border border-[#e4e4e7] rounded-md px-3 py-1.5 text-xs text-[#09090b] placeholder-[#a1a1aa] focus:outline-none focus:ring-1 focus:ring-[#18181b] focus:border-[#18181b] transition-all`
- Numerical, sizing, and code inputs must always use `font-mono`.

### 3. Drawers & Modals
- Modal backdrops: `bg-black/30 backdrop-blur-sm`
- Drawers: `w-[520px] bg-white h-full shadow-drawer border-l border-[#e4e4e7] animate-slide-in`
- Escape key listener and backdrop clicks must dismiss open overlays automatically.

---

## 3. Governance Rules

- Never introduce more than 1 accent color per page.
- Never use heavy drop shadows (`shadow-2xl` on ordinary cards) — prefer `border border-zinc-200 shadow-card`.
- Keep component props strictly typed in TypeScript (`interface ComponentProps`).
