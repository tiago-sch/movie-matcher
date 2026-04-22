import { motion } from 'framer-motion';
import { useLocale } from '../i18n/context';

export function LoadingState() {
  const { t } = useLocale();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-8 py-20"
    >
      <div className="relative w-16 h-16">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-full border-2 border-transparent"
          style={{ borderTopColor: 'var(--accent)', borderRightColor: 'var(--accent)' }}
        />
        <div className="absolute inset-2 rounded-full" style={{ background: 'var(--card)' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-3 h-3 rounded-full"
              style={{ background: 'var(--accent)' }}
            />
          </div>
        </div>
      </div>

      <div className="h-6 overflow-hidden relative w-64">
        {t.loading.map((text, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: [0, 1, 1, 0], y: [20, 0, 0, -20] }}
            transition={{
              delay: i * 1.4,
              duration: 1.4,
              repeat: Infinity,
              repeatDelay: t.loading.length * 1.4 - 1.4,
              times: [0, 0.15, 0.75, 1],
            }}
            className="absolute inset-x-0 text-center text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            {text}…
          </motion.p>
        ))}
      </div>
    </motion.div>
  );
}
