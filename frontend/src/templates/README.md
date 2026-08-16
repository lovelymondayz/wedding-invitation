# 🎨 Template System

## How to Add a New Template (3 Steps, ~10 Minutes)

### Step 1: Create the Template File

Create `frontend/src/templates/TemplateX_Name.tsx`:

```tsx
import { FC } from 'react';
import type { TemplateProps } from './types';

export const TemplateX_Name: FC<TemplateProps> = ({ data }) => {
  return (
    <div>
      {/* Your custom layout */}
      {/* Use data.couple, data.gallery, data.wishes, etc. */}
    </div>
  );
};
```

**TemplateProps** gives you:
- `data.couple` — groom, bride, date, venue, quote, etc.
- `data.countdown` — wedding date/time info
- `data.loveStory` — timeline events
- `data.schedule` — ceremony events
- `data.gallery` — photos array
- `data.wishes` — guest wishes
- `data.gifts` — gift/bank info
- `data.music` — active music track

### Step 2: Register the Template

Edit `frontend/src/templates/registry.ts`:

```tsx
import { TemplateX_Name } from './TemplateX_Name';

export const TEMPLATES: Record<number, TemplateDefinition> = {
  // ... existing templates ...
  4: {
    id: 4,
    name: 'My New Template',
    description: 'Short description',
    thumbnail: '/templates/4/thumb.jpg',
    component: TemplateX_Name,
  },
};
```

### Step 3: Add a Thumbnail

Place a screenshot at `frontend/public/templates/4/thumb.jpg` (recommended: 400x300px, ~50KB).

### Done! ✅

The template picker on the homepage and admin settings will automatically show your new template. No other code changes needed.

---

## Architecture

```
LandingPage → reads couple.template_id → looks up in TEMPLATES → renders Template
```

- **Zero branching** — no if/else chains
- **One file per template** — self-contained
- **Shared sections** — use existing `GallerySection`, `RSVPSection`, etc.
- **Tailwind CSS** — style freely, each template is isolated

## Thumbnail Placeholders

If you don't have a real screenshot yet, use these emoji placeholders in the picker:
- `💎` Template 1
- `⚡` Template 2
- `🌙` Template 3
- Add your own for Template 4+
