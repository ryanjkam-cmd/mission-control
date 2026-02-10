/**
 * Design System Configuration
 * Arkeus Marketing Agency - Mission Control
 */

export const colors = {
  brand: {
    purple: '#a855f7',
    cyan: '#22d3ee',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #22d3ee 100%)',
  },
  dark: {
    bg: '#0d1117',
    bgSecondary: '#161b22',
    bgTertiary: '#21262d',
    border: '#30363d',
    text: '#c9d1d9',
    textSecondary: '#8b949e',
  },
  accent: {
    blue: '#58a6ff',
    green: '#3fb950',
    yellow: '#d29922',
    red: '#f85149',
    purple: '#a371f7',
    pink: '#db61a2',
    cyan: '#39d353',
  },
};

export const transitions = {
  nav: '150ms ease-out',
  card: '200ms ease-out',
  smooth: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
};

export const spacing = {
  navExpanded: '300px',
  navCollapsed: '64px',
};

/**
 * Button Variants
 */
export const buttonVariants = {
  primary: 'gradient-brand text-white font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity duration-200',
  ghost: 'bg-transparent text-mc-text hover:bg-mc-bg-tertiary border border-mc-border px-4 py-2 rounded-lg transition-all duration-200',
  outline: 'bg-transparent text-brand-purple border-2 border-brand-purple hover:bg-brand-purple/10 px-4 py-2 rounded-lg transition-all duration-200',
};

/**
 * Card Variants
 */
export const cardVariants = {
  default: 'bg-mc-bg-secondary border border-mc-border rounded-lg p-4',
  glass: 'glass-dark rounded-lg p-4',
  elevated: 'bg-mc-bg-secondary border border-mc-border rounded-lg p-4 hover:border-brand-purple/50 transition-all duration-200',
  active: 'bg-mc-bg-secondary border-2 border-transparent gradient-brand-border rounded-lg p-4',
};

/**
 * Navigation Variants
 */
export const navVariants = {
  item: 'flex items-center gap-3 px-4 py-2 rounded-lg text-mc-text hover:bg-mc-bg-tertiary transition-all duration-150',
  itemActive: 'flex items-center gap-3 px-4 py-2 rounded-lg gradient-brand text-white transition-all duration-150',
  itemCollapsed: 'flex items-center justify-center w-12 h-12 rounded-lg text-mc-text hover:bg-mc-bg-tertiary transition-all duration-150',
  itemCollapsedActive: 'flex items-center justify-center w-12 h-12 rounded-lg gradient-brand text-white transition-all duration-150',
};

/**
 * Status Badge Variants
 */
export const statusBadgeVariants = {
  draft: 'bg-mc-text-secondary/20 text-mc-text-secondary border border-mc-text-secondary/50 px-2 py-1 rounded text-xs',
  scheduled: 'bg-mc-accent-yellow/20 text-mc-accent-yellow border border-mc-accent-yellow/50 px-2 py-1 rounded text-xs',
  published: 'bg-mc-accent-green/20 text-mc-accent-green border border-mc-accent-green/50 px-2 py-1 rounded text-xs',
  failed: 'bg-mc-accent-red/20 text-mc-accent-red border border-mc-accent-red/50 px-2 py-1 rounded text-xs',
};

/**
 * Platform Badge Variants
 */
export const platformBadgeVariants = {
  linkedin: 'bg-[#0A66C2]/20 text-[#0A66C2] border border-[#0A66C2]/50 px-2 py-1 rounded text-xs',
  x: 'bg-black/80 text-white border border-white/20 px-2 py-1 rounded text-xs',
  substack: 'bg-[#FF6719]/20 text-[#FF6719] border border-[#FF6719]/50 px-2 py-1 rounded text-xs',
  instagram: 'bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white border-0 px-2 py-1 rounded text-xs',
};

/**
 * Utility function to combine class names
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
