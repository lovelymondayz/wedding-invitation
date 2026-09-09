import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

export const MusicPlayer: FC<{
  isPlaying: boolean;
  volume: number;
  onToggle: () => void;
  onVolumeChange: (v: number) => void;
}> = ({ isPlaying, volume, onToggle, onVolumeChange }) => {
  const [showVolume, setShowVolume] = useState(false);

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 1 }}
      className="fixed top-4 right-4 z-40 bg-surface border border-border rounded-full p-2 flex items-center gap-2"
    >
      <button
        onClick={onToggle}
        className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary hover:bg-primary/30 transition-colors"
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <FaPause size={14} /> : <FaPlay size={14} />}
      </button>
      <div className="relative">
        <button
          onClick={() => setShowVolume(!showVolume)}
          className="w-10 h-10 rounded-full hover:bg-primary/10 flex items-center justify-center text-primary/60"
        >
          {volume === 0 ? <FaVolumeMute size={14} /> : <FaVolumeUp size={14} />}
        </button>
        {showVolume && (
          <div className="absolute top-12 right-0 bg-surface border border-border rounded-lg p-3">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-24 accent-primary"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};
