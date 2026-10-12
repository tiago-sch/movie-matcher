import { motion } from 'framer-motion';

interface StatusMessageProps {
  message: string;
  tone?: 'error' | 'muted';
  action?: { label: string; onClick: () => void };
}

export function StatusMessage({ message, tone = 'muted', action }: StatusMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-4 py-16 text-center"
    >
      <p className="text-base" style={{ color: tone === 'error' ? 'rgba(252,165,165,0.9)' : 'var(--text-muted)' }}>{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 rounded-full text-sm cursor-pointer"
          style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'transparent' }}
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
