/**
 * CodeCombat - Application Constants
 * Centralized configuration values for the game
 */

// ============================================
// STORAGE KEYS
// ============================================

/** LocalStorage key constants for persistent data */
export const STORAGE_KEYS = {
    /** User's overall game progress */
    PROGRESS: 'codecombat_progress',
    /** Saved code for each level (prefix + levelId) */
    LEVEL_CODE_PREFIX: 'codecombat_code_',
    /** User preferences and settings */
    SETTINGS: 'codecombat_settings',
    /** Current session data */
    SESSION: 'codecombat_session',
    /** Achievement unlock data */
    ACHIEVEMENTS: 'codecombat_achievements',
} as const;

// ============================================
// GRID CONFIGURATION
// ============================================

/** Size of each grid cell in pixels */
export const GRID_CELL_SIZE = 80;

/** Minimum grid dimensions */
export const MIN_GRID_WIDTH = 5;
export const MIN_GRID_HEIGHT = 5;

/** Maximum grid dimensions */
export const MAX_GRID_WIDTH = 20;
export const MAX_GRID_HEIGHT = 15;

// ============================================
// EXECUTION CONFIGURATION
// ============================================

/** Maximum execution time in milliseconds before timeout */
export const MAX_EXECUTION_TIME = 5000;

/** Maximum number of execution steps before stopping */
export const MAX_EXECUTION_STEPS = 1000;

/** Default animation delay between steps (ms) */
export const ANIMATION_DELAYS = {
    slow: 800,
    normal: 400,
    fast: 150,
    instant: 0,
} as const;

// ============================================
// PLAYER DEFAULTS
// ============================================

/** Default player health */
export const DEFAULT_PLAYER_HEALTH = 100;

/** Default player starting direction */
export const DEFAULT_START_DIRECTION = 'right' as const;

// ============================================
// GAME MECHANICS
// ============================================

/** Points awarded for various actions */
export const SCORE_VALUES = {
    collectGem: 100,
    collectCoin: 50,
    collectKey: 75,
    defeatEnemy: 200,
    completeLevel: 500,
    bonusStar: 250,
} as const;

/** Damage values for hazards */
export const HAZARD_DAMAGE = {
    spike: 25,
    fire: 10,
    pit: 100,
    laser: 50,
} as const;

// ============================================
// UI CONFIGURATION
// ============================================

/** Toast notification durations (ms) */
export const TOAST_DURATION = {
    short: 2000,
    normal: 4000,
    long: 6000,
} as const;

/** Editor configuration */
export const EDITOR_CONFIG = {
    defaultFontSize: 14,
    minFontSize: 10,
    maxFontSize: 24,
    tabSize: 4,
} as const;

// ============================================
// API & TIMING
// ============================================

/** Debounce delay for auto-save (ms) */
export const AUTO_SAVE_DELAY = 1000;

/** Retry configuration for failed operations */
export const RETRY_CONFIG = {
    maxRetries: 3,
    retryDelay: 1000,
} as const;
