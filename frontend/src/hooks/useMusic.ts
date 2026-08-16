import { useState, useRef, useEffect } from 'react';

/**
 * Music source types:
 * - direct: URL to an MP3/WAV file (played via <audio>)
 * - spotify: Spotify track URL (played via embed iframe)
 * - youtube: YouTube video URL (played via embed iframe)
 * - soundcloud: SoundCloud URL (played via embed iframe)
 */
export type MusicSource = 'direct' | 'spotify' | 'youtube' | 'soundcloud' | 'vimeo';

export function useMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [source, setSource] = useState<MusicSource | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const setMusicUrl = (url: string, trackSource?: string) => {
    const detectedSource = (trackSource as MusicSource) || detectSource(url);
    setSource(detectedSource);

    if (detectedSource === 'direct' && audioRef.current) {
      audioRef.current.src = url;
    }
  };

  const toggle = () => {
    if (source === 'direct' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
    }
    setIsPlaying(!isPlaying);
  };

  const changeVolume = (v: number) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  return { isPlaying, volume, source, toggle, changeVolume, setMusicUrl };
}

function detectSource(url: string): MusicSource {
  if (url.includes('spotify.com')) return 'spotify';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('soundcloud.com')) return 'soundcloud';
  if (url.includes('vimeo.com')) return 'vimeo';
  return 'direct';
}
