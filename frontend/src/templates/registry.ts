import { TemplateComponent } from './types';
import { TemplateA_Classic } from './TemplateA_Classic';
import { TemplateB_GenZ } from './TemplateB_GenZ';
import { TemplateC_DarkLuxe } from './TemplateC_DarkLuxe';

export interface TemplateDefinition {
  id: number;
  name: string;
  description: string;
  thumbnail: string;
  component: TemplateComponent;
}

/**
 * Template Registry
 * 
 * To add a new template:
 * 1. Create TemplateX_Name.tsx in this folder
 * 2. Import it above
 * 3. Add an entry below with a unique ID
 * 4. Add a thumbnail at /public/templates/{id}/thumb.jpg
 */
export const TEMPLATES: Record<number, TemplateDefinition> = {
  1: {
    id: 1,
    name: 'Classic Elegance',
    description: 'Glassmorphism, serif headings, warm cream & gold',
    thumbnail: '/templates/1/thumb.jpg',
    component: TemplateA_Classic,
  },
  2: {
    id: 2,
    name: 'Gen-Z Minimal',
    description: 'Clean white, sans-serif, bold accents, Instagram vibe',
    thumbnail: '/templates/2/thumb.jpg',
    component: TemplateB_GenZ,
  },
  3: {
    id: 3,
    name: 'Dark Luxe',
    description: 'Dark background, gold serif text, cinematic feel',
    thumbnail: '/templates/3/thumb.jpg',
    component: TemplateC_DarkLuxe,
  },
};

export const getTemplate = (id: number): TemplateDefinition => {
  return TEMPLATES[id] || TEMPLATES[1];
};

export const getAllTemplates = (): TemplateDefinition[] => {
  return Object.values(TEMPLATES).sort((a, b) => a.id - b.id);
};
