// Lightweight class-name merger — no external dependency
type ClassValue = string | number | boolean | undefined | null | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  return inputs
    .flat(Infinity as 1)
    .filter((v): v is string | number => typeof v === 'string' || typeof v === 'number')
    .join(' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function getScoreColor(score: number): string {
  if (score >= 75) return 'text-accent-400';
  if (score >= 50) return 'text-yellow-400';
  return 'text-danger-400';
}

export function getScoreLabel(score: number): string {
  if (score >= 75) return 'Excellent';
  if (score >= 50) return 'Good';
  if (score >= 30) return 'Fair';
  return 'Poor';
}

export function truncate(str: string, maxLength = 50): string {
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
}
