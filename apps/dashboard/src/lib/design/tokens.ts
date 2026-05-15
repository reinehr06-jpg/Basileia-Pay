export const tokens = {
  color: {
    background:    'var(--color-background)',
    surface:       'var(--color-surface)',
    surfaceRaised: 'var(--color-surface-raised)',
    border:        'var(--color-border)',
    ink:           'var(--color-ink)',
    inkMuted:      'var(--color-ink-muted)',
    inkSubtle:     'var(--color-ink-subtle)',
    brand:         'var(--color-brand)',
    brandMuted:    'var(--color-brand-muted)',
    success:       'var(--color-success)',
    successMuted:  'var(--color-success-muted)',
    warning:       'var(--color-warning)',
    warningMuted:  'var(--color-warning-muted)',
    danger:        'var(--color-danger)',
    dangerMuted:   'var(--color-danger-muted)',
    info:          'var(--color-info)',
    infoMuted:     'var(--color-info-muted)',
  },
  radius: {
    sm: '6px', md: '10px', lg: '16px', full: '9999px',
  },
  shadow: {
    sm:  '0 1px 3px rgba(0,0,0,.08)',
    md:  '0 4px 12px rgba(0,0,0,.10)',
    lg:  '0 8px 30px rgba(0,0,0,.14)',
  },
} as const;
