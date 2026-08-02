export const CONFIG = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  BREAKPOINTS: {
    desktop: 1200,
    tablet: 768,
    mobile: 390,
  },
  UNDO_LIMIT: 50,
  TOAST_DURATION: 3000,
  COLOR_PRESETS: [
    '#020617', '#0f172a', '#1e293b', '#334155',
    '#475569', '#64748b', '#94a3b8', '#cbd5e1',
    '#e2e8f0', '#f1f5f9', '#f8fafc', '#ffffff',
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#3b82f6', '#8b5cf6', '#ec4899',
  ],
};
