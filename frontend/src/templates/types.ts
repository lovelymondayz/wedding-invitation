import type { FC } from 'react';
import type { Couple, CountdownInfo, LoveStoryEvent, ScheduleEvent, GalleryPhoto, Wish, GiftInfo, MusicTrack } from '../api/types';

/**
 * Every template receives the same data.
 * Use what you need, ignore what you don't.
 */
export interface TemplateProps {
  data: {
    couple: Couple | null;
    countdown: CountdownInfo | null;
    loveStory: LoveStoryEvent[];
    schedule: ScheduleEvent[];
    gallery: GalleryPhoto[];
    wishes: Wish[];
    gifts: GiftInfo[];
    music: MusicTrack | null;
  };
}

export type TemplateComponent = FC<TemplateProps>;

export interface TemplateDefinition {
  id: number;
  name: string;
  description: string;
  thumbnail: string;
  component: TemplateComponent;
}
