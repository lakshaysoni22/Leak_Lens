import { clsx, type ClassValue } from 'clsx';

/** Merge Tailwind class names conditionally */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Format a risk score to one decimal */
export function formatScore(score: number): string {
  return score.toFixed(1);
}

/** Human-readable risk level label */
export function riskLabel(level: string): string {
  return { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' }[level] ?? level;
}

/** CSS class for a risk level */
export function riskClass(level: string): string {
  return { critical: 'risk-critical', high: 'risk-high', medium: 'risk-medium', low: 'risk-low' }[level] ?? '';
}

/** Badge CSS class for a risk level */
export function riskBadgeClass(level: string): string {
  return { critical: 'badge-critical', high: 'badge-high', medium: 'badge-medium', low: 'badge-low' }[level] ?? '';
}

/** Format ISO date string to readable form */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/** Format ISO date + time */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/** Mask email for display: ab***@domain.com */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  return local.slice(0, 2) + '***@' + domain;
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Format large numbers with commas */
export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

/** Truncate a string to maxLength */
export function truncate(str: string, maxLength = 60): string {
  return str.length > maxLength ? str.slice(0, maxLength) + '…' : str;
}

/** Colour for a risk level */
export function riskColour(level: string): string {
  return { critical: '#FF5A5A', high: '#FFB547', medium: '#FFE066', low: '#A3FF6F' }[level] ?? '#929BAD';
}
