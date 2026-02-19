/**
 * CodeCombat - Space Theme Color System
 * Consistent color palette used across the entire game
 */

export const COLORS = {
    // Primary backgrounds - Deep space
    background: {
        primary: '#0a0a1a',     // Deep space black
        secondary: '#12122a',   // Slightly lighter space
        tertiary: '#1a1a3a',    // Card backgrounds
        elevated: '#222244',    // Elevated elements
    },

    // Accent colors - Mars/Space themed
    accent: {
        mars: '#ff6b4a',        // Mars orange-red
        marsLight: '#ff8a6a',   // Light mars
        marsDark: '#cc4a2a',    // Dark mars
        nebula: '#8b5cf6',      // Purple nebula
        nebulaLight: '#a78bfa', // Light nebula
        cosmic: '#06b6d4',      // Cyan cosmic
        cosmicLight: '#22d3ee', // Light cosmic
        star: '#fbbf24',        // Golden star
        starLight: '#fcd34d',   // Light star
    },

    // UI colors
    ui: {
        success: '#22c55e',     // Green success
        successLight: '#4ade80',
        warning: '#f59e0b',     // Orange warning
        warningLight: '#fbbf24',
        error: '#ef4444',       // Red error
        errorLight: '#f87171',
        info: '#3b82f6',        // Blue info
        infoLight: '#60a5fa',
    },

    // Text colors
    text: {
        primary: '#ffffff',
        secondary: '#a0a0c0',
        tertiary: '#6b6b8a',
        muted: '#4a4a6a',
    },

    // Border colors
    border: {
        primary: '#2a2a4a',
        secondary: '#3a3a5a',
        accent: '#4a4a7a',
    },

    // Gradient presets
    gradients: {
        mars: 'linear-gradient(135deg, #ff6b4a 0%, #cc4a2a 100%)',
        nebula: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
        cosmic: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
        space: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 50%, #12122a 100%)',
        starfield: 'radial-gradient(ellipse at center, #1a1a3a 0%, #0a0a1a 100%)',
    },
} as const;

// CSS custom properties for theme
export const CSS_VARS = `
  :root {
    --color-bg-primary: ${COLORS.background.primary};
    --color-bg-secondary: ${COLORS.background.secondary};
    --color-bg-tertiary: ${COLORS.background.tertiary};
    --color-bg-elevated: ${COLORS.background.elevated};
    
    --color-mars: ${COLORS.accent.mars};
    --color-mars-light: ${COLORS.accent.marsLight};
    --color-mars-dark: ${COLORS.accent.marsDark};
    --color-nebula: ${COLORS.accent.nebula};
    --color-cosmic: ${COLORS.accent.cosmic};
    --color-star: ${COLORS.accent.star};
    
    --color-success: ${COLORS.ui.success};
    --color-warning: ${COLORS.ui.warning};
    --color-error: ${COLORS.ui.error};
    --color-info: ${COLORS.ui.info};
    
    --color-text-primary: ${COLORS.text.primary};
    --color-text-secondary: ${COLORS.text.secondary};
    --color-text-tertiary: ${COLORS.text.tertiary};
    
    --color-border-primary: ${COLORS.border.primary};
    --color-border-secondary: ${COLORS.border.secondary};
  }
`;
