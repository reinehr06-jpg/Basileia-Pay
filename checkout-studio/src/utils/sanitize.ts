export function sanitizeCSS(css: string): string {
  if (!css) return '';
  // Remover expressões perigosas
  return css
    .replace(/expression\s*\(/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/url\s*\(['"]?data:/gi, '')
    .replace(/@import/gi, '')
    .replace(/<script/gi, '')
    .replace(/<\/script/gi, '');
}
