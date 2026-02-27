/**
 * CRM THEME CONFIGURATION
 * Centralized theme constants and utilities for TypeScript
 */

// ============================================
// COLOR PALETTE
// ============================================

export const colors = {
  // Primary (Indigo)
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },
  
  // Secondary (Violet)
  secondary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },
  
  // Accent Colors
  blue: {
    500: '#3b82f6',
    600: '#2563eb',
  },
  emerald: {
    500: '#10b981',
    600: '#059669',
  },
  amber: {
    500: '#f59e0b',
    600: '#d97706',
  },
  red: {
    500: '#ef4444',
    600: '#dc2626',
  },
  
  // Neutral (Slate)
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
} as const;

// ============================================
// GRADIENTS
// ============================================

export const gradients = {
  primary: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
  background: 'linear-gradient(135deg, #f8fafc 0%, #dbeafe 50%, #e0e7ff 100%)',
  card: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.95))',
  
  // Specific gradient combinations
  indigoViolet: 'from-indigo-600 to-violet-600',
  blueIndigo: 'from-blue-500 to-indigo-600',
  emeraldTeal: 'from-emerald-500 to-teal-600',
  amberOrange: 'from-amber-500 to-orange-600',
  violetPurple: 'from-violet-500 to-purple-600',
} as const;

// ============================================
// SPACING SYSTEM
// ============================================

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  '4xl': '6rem',    // 96px
} as const;

// ============================================
// BORDER RADIUS
// ============================================

export const radius = {
  sm: '0.5rem',     // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px
  '2xl': '2rem',    // 32px
  full: '9999px',   // Pill shape
} as const;

// ============================================
// SHADOWS
// ============================================

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  glow: '0 0 20px rgba(99, 102, 241, 0.3)',
} as const;

// ============================================
// TRANSITIONS
// ============================================

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// ============================================
// TYPOGRAPHY
// ============================================

export const typography = {
  fontFamily: {
    sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    mono: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
  },
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '900',
  },
} as const;

// ============================================
// STATUS COLORS
// ============================================

export const statusColors = {
  lead: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  prospect: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  customer: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  partner: {
    bg: 'bg-violet-100',
    text: 'text-violet-700',
    border: 'border-violet-200',
  },
  pending: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  completed: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  cancelled: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
  },
} as const;

// ============================================
// PRIORITY COLORS
// ============================================

export const priorityColors = {
  low: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
  },
  medium: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
  },
  high: {
    bg: 'bg-orange-100',
    text: 'text-orange-600',
  },
  critical: {
    bg: 'bg-red-100',
    text: 'text-red-600',
  },
} as const;

// ============================================
// ACTIVITY TYPE COLORS
// ============================================

export const activityColors = {
  call: {
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-100',
    text: 'text-blue-600',
  },
  email: {
    gradient: 'from-violet-500 to-violet-600',
    bg: 'bg-violet-100',
    text: 'text-violet-600',
  },
  meeting: {
    gradient: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-100',
    text: 'text-emerald-600',
  },
  task: {
    gradient: 'from-amber-500 to-amber-600',
    bg: 'bg-amber-100',
    text: 'text-amber-600',
  },
  note: {
    gradient: 'from-slate-500 to-slate-600',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
  },
} as const;

// ============================================
// DEAL STAGE COLORS
// ============================================

export const dealStageColors = {
  qualification: {
    gradient: 'from-blue-500 to-blue-600',
    label: 'Qualification',
  },
  needs_analysis: {
    gradient: 'from-indigo-500 to-indigo-600',
    label: 'Needs Analysis',
  },
  proposal: {
    gradient: 'from-violet-500 to-violet-600',
    label: 'Proposal',
  },
  negotiation: {
    gradient: 'from-purple-500 to-purple-600',
    label: 'Negotiation',
  },
  closed_won: {
    gradient: 'from-emerald-500 to-emerald-600',
    label: 'Closed Won',
  },
  closed_lost: {
    gradient: 'from-slate-400 to-slate-500',
    label: 'Closed Lost',
  },
} as const;

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get status color classes
 */
export const getStatusColor = (status: string) => {
  return statusColors[status as keyof typeof statusColors] || statusColors.lead;
};

/**
 * Get priority color classes
 */
export const getPriorityColor = (priority: string) => {
  return priorityColors[priority as keyof typeof priorityColors] || priorityColors.medium;
};

/**
 * Get activity type color classes
 */
export const getActivityColor = (type: string) => {
  return activityColors[type as keyof typeof activityColors] || activityColors.note;
};

/**
 * Get deal stage color and label
 */
export const getDealStageColor = (stage: string) => {
  return dealStageColors[stage as keyof typeof dealStageColors] || dealStageColors.qualification;
};

/**
 * Get lead score color based on value
 */
export const getScoreColor = (score: number): { bg: string; text: string } => {
  if (score >= 80) return { bg: 'bg-emerald-50', text: 'text-emerald-600' };
  if (score >= 50) return { bg: 'bg-amber-50', text: 'text-amber-600' };
  if (score >= 30) return { bg: 'bg-orange-50', text: 'text-orange-600' };
  return { bg: 'bg-red-50', text: 'text-red-600' };
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date
 */
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date with time
 */
export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Get relative time string
 */
export const getRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
};

// ============================================
// BREAKPOINTS (for reference)
// ============================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================
// Z-INDEX SCALE
// ============================================

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
} as const;

// ============================================
// EXPORT DEFAULT THEME
// ============================================

export const theme = {
  colors,
  gradients,
  spacing,
  radius,
  shadows,
  transitions,
  typography,
  statusColors,
  priorityColors,
  activityColors,
  dealStageColors,
  breakpoints,
  zIndex,
} as const;

export default theme;