# DESIGN.md — Wedding Invitation

Build interfaces that feel intentional, distinctive, and restrained. No generic "AI SaaS" aesthetics — every visual element must have a purpose: hierarchy, interaction, information, or brand identity.

This file is the **single source of truth** for the wedding's visual language. Every color, type size, spacing value, radius, shadow, and motion timing traces back to a token defined here. Change a value once, in one place, and the whole product updates.

Works alongside `antislop` (miqdadbadjuber/anti-slop): antislop is a *filter* that stops generic AI-slop output; this file supplies the direction — the actual colors, type, and rules antislop checks against.

**Rule zero: no design values in components.** Components must not contain visual values that belong to the design system. Banned in JSX/CSS:
- Raw hex/rgb/hsl colors
- Arbitrary spacing (`p-[23px]`, `gap-[13px]`)
- Arbitrary border-radius (`rounded-[17px]`)
- Arbitrary shadows (`shadow-[0_4px_20px_...]`)
- Arbitrary font sizes (`text-[13px]`)
- Arbitrary animation durations

Allowed: structural utilities (`w-full`, `flex`, `grid`), accessibility attributes (`aria-label`, `data-state`), and any token from `globals.css`.

If a component needs a visual value not in the tokens, add it to `globals.css` first.

---

## Visual Identity

The interface should feel: intentional, recognizable, restrained, functional.

Mood: warm, romantic, elegant, grounded
Density: spacious with generous whitespace
Shape language: soft, rounded, organic
Typography character: refined serif display + clean sans body
Color character: warm cream base, gold accent, dark brown text
Motion character: gentle, purposeful, never excessive

**Brand anchor:** Gold `#D4A574` — warm, elegant, celebratory. Avoids default indigo/purple SaaS convergence. Pairs naturally with cream and dark brown for a timeless wedding aesthetic.

---

## 1. Tailwind Mapping

This project uses Tailwind v3. Tokens live in `tailwind.config.js` under `theme.extend`. Components consume semantic tokens only.

```js
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primitives
        neutral: { 0: '#FFFFFF', 50: '#FFFBF5', 100: '#FFF8F0', 200: '#F5E6E0', 300: '#E8D5C8', 400: '#D4A574', 500: '#C4956A', 600: '#A67B5B', 700: '#8B6347', 800: '#2C1810', 900: '#1a0e08' },
        gold: { 50: '#FDF8F0', 100: '#F5E6D0', 300: '#E8D5C8', 400: '#DDB88A', 500: '#D4A574', 600: '#C4956A', 700: '#A67B5B', 800: '#8B6347' },
        // Semantic
        bg: '#FFFBF5',
        surface: '#FFFFFF',
        'surface-alt': '#FFF8F0',
        border: '#F5E6E0',
        'border-strong': '#E8D5C8',
        text: '#2C1810',
        'text-muted': '#8B6347',
        'text-subtle': '#D4A574',
        primary: '#D4A574',
        'primary-hover': '#C4956A',
        'primary-active': '#A67B5B',
        'primary-subtle': '#FDF8F0',
        success: '#6B8F71',
        'success-subtle': '#E8F0E6',
        warning: '#D4A574',
        'warning-subtle': '#FDF8F0',
        danger: '#C4432E',
        'danger-subtle': '#F6E1DC',
        info: '#2E6FA8',
        'info-subtle': '#DCE9F3',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Cormorant Garamond"', '"Playfair Display"', 'serif'],
        script: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(44, 24, 16, 0.06)',
        md: '0 2px 8px rgba(44, 24, 16, 0.08), 0 1px 2px rgba(44, 24, 16, 0.04)',
        lg: '0 8px 24px rgba(44, 24, 16, 0.12), 0 2px 6px rgba(44, 24, 16, 0.06)',
      },
      transitionDuration: {
        fast: '120ms',
        base: '200ms',
        slow: '320ms',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
```

---

## 2. Color Tokens

Two layers: **primitives** (raw hex, rarely referenced) and **semantic** (what components use). Always build UI from semantic tokens.

**Primitives:**
- Neutral 50–900: warm cream → dark brown scale
- Gold 50–800: brand accent scale

**Semantic tokens:**
- Surface: `bg`, `surface`, `surface-alt`, `border`, `border-strong`
- Text: `text`, `text-muted`, `text-subtle`
- Primary: `primary`, `primary-hover`, `primary-active`, `primary-subtle`
- Status: `success`, `warning`, `danger`, `info` (+ `-subtle` variants)

---

## 3. Typography

- **Display:** Cormorant Garamond — elegant serif for names, headings
- **Script:** Playfair Display — italic accent for quotes, decorative text
- **Body:** Inter — clean sans for UI, forms, body text

| Token | Size / line-height | Weight | Use |
|---|---|---|---|
| `text-xs` | 0.75rem / 1rem | 400 | metadata, timestamps |
| `text-sm` | 0.875rem / 1.25rem | 400 | body, labels |
| `text-base` | 1rem / 1.5rem | 400 | body |
| `text-lg` | 1.125rem / 1.75rem | 500 | card titles |
| `text-xl` | 1.25rem / 1.75rem | 600 | panel headers |
| `text-2xl` | 1.5rem / 2rem | 600 | section titles |
| `text-3xl` | 1.875rem / 2.25rem | 600 | page titles |
| `text-4xl` | 2.25rem / 2.5rem | 600 | hero names |
| `text-5xl` | 3rem / 1 | 600 | hero names (lg) |
| `text-6xl` | 3.75rem / 1 | 600 | hero names (xl) |
| `text-7xl` | 4.5rem / 1 | 600 | hero names (2xl) |
| `text-8xl` | 6rem / 1 | 600 | hero names (3xl) |

**Rules:** Two weights — 400 (body) and 600 (emphasis). No 700/800. Line length caps at ~72ch. Headings use display/body fonts only — no arbitrary font families.

---

## 4. Spacing & Layout

Use Tailwind's default 4px-base scale. Container: `max-w-6xl` with `px-4 md:px-8` gutters.

**Layout rules:** Choose layout based on content. No auto dashboard grids, sidebars, centered hero sections, card grids, or 12-column layouts. Responsive layouts intentionally designed.

---

## 5. Radius, Borders, Shadows

- `sm` (0.375rem) — checkboxes, small chips
- `md` (0.5rem) — inputs, buttons
- `lg` (0.75rem) — cards, modals
- `xl` (1rem) — large cards, lightboxes
- `full` (9999px) — avatars, pills, badges

One radius per component type. Default border: `1px solid border`. Shadows: `sm` (resting) → `md` (hover) → `lg` (modals). Nothing heavier than `lg`.

---

## 6. Motion

- `fast` (120ms) — hover/press
- `base` (200ms) — dropdowns/toasts
- `slow` (320ms) — modal/panel entrances

Animation communicates state, navigation, feedback, spatial relationships — not decoration. No fade-ins, slide-ups, bouncing, floating, parallax. Respect `prefers-reduced-motion`.

---

## 7. Icons

**Lucide React, 1.5px stroke, 20px default.** One library, one stroke weight. No mixing with emoji-as-icon.

---

## 8. Components

**Primary button:** `bg-primary hover:bg-primary-hover text-white font-medium rounded-full px-8 py-3.5 shadow-sm transition-colors duration-fast`.

**Outline button:** `border border-primary/50 text-primary hover:bg-primary-subtle rounded-full px-8 py-3 transition-colors duration-fast`.

**Card:** `bg-surface border border-border rounded-xl shadow-sm p-6`.

**Input:** `bg-surface border border-border rounded-lg px-4 py-3 text-text placeholder:text-text-subtle focus:border-primary focus:ring-2 focus:ring-primary-subtle transition-colors duration-fast`.

**Section alternate:** `bg-surface-alt`.

---

## 9. Anti-Slop Guardrails

Reference: https://github.com/miqdadbadjuber/anti-slop

No generic AI patterns unless deliberate:
- No purple/indigo-to-pink gradients, neon glows, radial "orb" blobs
- No glassmorphism — use solid `bg-surface` + `border-border` instead
- No icon-in-a-colored-circle per feature card unless load-bearing
- No invented stats, fake testimonials, fake avatar stacks
- Empty states get real copy + real next action
- No `shadow-2xl` — cap at `shadow-lg`
- Contrast checked, not assumed — WCAG AA
- No mixed border-radius scales on the same surface
- One icon set, one stroke weight
- No glassmorphism, decorative blobs, excessive pills, meaningless badges, random icons, excessive animation, generic marketing copy

Anti-Slop is a filter. This file is the identity.

---

## 10. Hierarchy

Every screen must have a clear:
1. Primary task
2. Primary information
3. Secondary information
4. Supporting actions

Do not give every element equal visual weight. Use typography, spacing, contrast, and placement before adding borders, cards, badges, or color.

---

## 11. AI Rules

Before changing UI:
1. Read DESIGN.md.
2. Inspect existing components.
3. Reuse existing tokens.
4. Reuse existing components.
5. Prefer variants over duplication.
6. Do not invent colors or spacing.
7. Do not redesign unrelated UI.
8. Preserve the existing visual language.
9. Check responsive behavior.
10. Check accessibility.

If introducing a new visual pattern, explain why it is necessary.

---

## 12. Quality Gate

- [ ] Uses design tokens
- [ ] No arbitrary design values
- [ ] Reuses existing components
- [ ] Has clear hierarchy
- [ ] Responsive
- [ ] Accessible
- [ ] Interactive states handled
- [ ] No unnecessary decoration
- [ ] No generic AI UI patterns
- [ ] Feels specific to the product

---

## 13. Maintenance

1. Existing token covers this? Use it.
2. Standard Tailwind value? Prefer it over a new token.
3. Genuinely new semantic need? Add to `tailwind.config.js` with a role name.
4. Never add a token that's just a slightly different hex — reuse existing.
5. Don't create tokens for one-off values.
6. New brand color? Regenerate primitive scale, keep semantic names untouched.
