import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const InvitePopup: FC<{
  guestName: string;
  onOpen: () => void;
  quote?: string;
}> = ({ guestName, onOpen, quote }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-dark/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="glass rounded-3xl p-8 md:p-12 max-w-lg mx-4 text-center relative overflow-hidden"
        >
          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-20 h-20 opacity-10">
            <svg viewBox="0 0 100 100" fill="#D4A574"><path d="M0,0 Q50,20 0,50 Q20,50 50,100 Q30,50 0,0 Z" /></svg>
          </div>
          <div className="absolute bottom-0 right-0 w-20 h-20 opacity-10 rotate-180">
            <svg viewBox="0 0 100 100" fill="#D4A574"><path d="M0,0 Q50,20 0,50 Q20,50 50,100 Q30,50 0,0 Z" /></svg>
          </div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <p className="text-dark/50 text-sm uppercase tracking-widest mb-6">Wedding Invitation</p>
            <p className="text-dark/70 text-lg mb-2">Dear,</p>
            <h2 className="font-serif text-3xl md:text-4xl text-dark mb-6">{guestName}</h2>
            <p className="text-dark/70 text-lg mb-2">You are invited to celebrate</p>
            <p className="text-dark/70 text-lg mb-8">our wedding.</p>
            {quote && <p className="font-serif text-gold italic text-lg mb-8">"{quote}"</p>}
            <button onClick={onOpen} className="btn-gold text-lg px-10 py-4">
              Open Invitation
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
