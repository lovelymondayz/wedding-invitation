import { FC, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface MusicEmbedProps {
  url: string;
  source: string;
  title?: string;
}

/**
 * Converts various music URLs to their embed equivalents
 */
function getEmbedUrl(url: string, source: string): string | null {
  if (source === 'spotify') {
    // Convert open.spotify.com/track/ID to embed
    const match = url.match(/track\/([a-zA-Z0-9]+)/);
    if (match) return `https://open.spotify.com/embed/track/${match[1]}`;
    // Already an embed URL
    if (url.includes('/embed/')) return url;
    return null;
  }

  if (source === 'youtube') {
    let videoId = '';
    const ytMatch = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) videoId = ytMatch[1];
    if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=0`;
    return null;
  }

  if (source === 'soundcloud') {
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23d4a574&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`;
  }

  return null;
}

export const MusicEmbed: FC<MusicEmbedProps> = ({ url, source, title }) => {
  const embedUrl = getEmbedUrl(url, source);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!embedUrl) {
    return (
      <div className="fixed top-4 right-4 z-40 glass rounded-xl p-3 text-dark/60 text-sm">
        Unsupported music source
      </div>
    );
  }

  const togglePlay = () => {
    if (!iframeRef.current) return;
    const iframe = iframeRef.current;
    
    if (source === 'spotify') {
      // Spotify embed uses postMessage
      iframe.contentWindow?.postMessage({ command: isPlaying ? 'pause' : 'play' }, '*');
    } else if (source === 'youtube') {
      iframe.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: isPlaying ? 'pauseVideo' : 'playVideo' }),
        '*'
      );
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 1 }}
      className="fixed top-4 right-4 z-40 glass rounded-2xl p-3 flex flex-col items-end gap-2 max-w-[280px]"
    >
      <div className="flex items-center gap-2 w-full">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold hover:bg-gold/30 transition-colors shrink-0"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <span className="text-dark/60 text-xs truncate flex-1">{title || 'Music'}</span>
      </div>
      <iframe
        ref={iframeRef}
        src={embedUrl}
        width="260"
        height={source === 'spotify' ? '80' : '150'}
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title={title || 'Music player'}
        className="rounded-lg"
      />
    </motion.div>
  );
};
