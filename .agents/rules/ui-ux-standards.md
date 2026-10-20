# UI/UX & Frontend Craft Guidelines

Every UI component in this workspace must adhere to high-craft design engineering standards:

1. **Aesthetic Tone**:
   - Clean, minimalist, and enterprise-grade professional (inspired by Linear, Vercel, Raycast, Twenty).
   - Use subtle 1px borders (`border-zinc-200`) and soft card shadows rather than heavy shadows or vibrant gradients.
   - Background canvas: `#fbfbfb`, Cards: `#ffffff`, Subtles: `#f4f4f5`.

2. **Typography**:
   - Sans-serif modern typography (`Inter`, `Geist`, system-ui).
   - Monospace font (`font-mono`) for SKUs, sizing dimensions, currencies, and dates.
   - Restrain font sizes: 10px (micro), 11px (caption/table header), 12px (body/cells/inputs), 14px (headings).

3. **Spatial Grid**:
   - Strictly adhere to 4px / 8px spacing multiples (`gap-2`, `gap-3`, `p-3`, `p-4`, `p-6`).

4. **Component Patterns**:
   - Interactive data tables with sticky headers, subtle hover rows, and status badges.
   - Kanban boards with drag-and-drop, clear column counts, and drag-over ring indicators.
   - Slide-over detail drawers for non-destructive record inspection and editing.
   - Form inputs with clear focus rings (`focus:ring-1 focus:ring-zinc-900 focus:outline-none`).
