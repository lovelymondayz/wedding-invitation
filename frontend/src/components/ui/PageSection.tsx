import { motion } from 'framer-motion';

interface PageSectionProps {
  id: string;
  className?: string;
  children: React.ReactNode;
  alternate?: boolean;
}

export function PageSection({ id, className = '', children, alternate }: PageSectionProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] }}
      className={`py-20 px-4 md:px-8 ${alternate ? 'bg-surface-alt' : ''} ${className}`}
    >
      <div className="max-w-6xl mx-auto">
        {children}
      </div>
    </motion.section>
  );
}

export function SectionTitle({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) {
  return (
    <div className="text-center mb-16">
      <div className="ornament-divider mb-4">
        <span className="text-primary/60 text-xs tracking-[0.3em] uppercase">✦</span>
      </div>
      <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-text mb-4 tracking-tight">
        {children}
      </h2>
      {subtitle && (
        <p className="text-text-muted text-base md:text-lg max-w-xl mx-auto leading-relaxed font-light">
          {subtitle}
        </p>
      )}
      <div className="mt-6 mx-auto w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
    </div>
  );
}

export function GlassCard({ children, className = '', hover = false }: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <motion.div
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ duration: 0.3 }}
      className={`bg-surface border border-border rounded-xl p-6 md:p-8 ${hover ? 'hover:border-border-strong' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}
