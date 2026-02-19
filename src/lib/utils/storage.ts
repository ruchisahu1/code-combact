/**
 * CodeCombat - LocalStorage Utility Class
 * Handles persistent storage for game progress and saved code
 */

import type { StoredProgress, UserSettings } from '@/lib/game/types';
import { STORAGE_KEYS } from './constants';

/** Default user settings */
const DEFAULT_SETTINGS: UserSettings = {
    soundEnabled: true,
    musicEnabled: true,
    animationSpeed: 'normal',
    theme: 'system',
    fontSize: 'medium',
    showHints: true,
    showLineNumbers: true,
};

/** Default progress for new users */
const DEFAULT_PROGRESS: StoredProgress = {
    currentLevelId: 'level-1',
    completedLevels: [],
    totalStars: 0,
    totalScore: 0,
    achievements: [],
    settings: DEFAULT_SETTINGS,
    lastPlayedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
};

/**
 * LocalStorage utility class for managing game data persistence.
 * Provides type-safe methods for storing and retrieving game progress and code.
 */
export class LocalStorage {
    /**
     * Check if localStorage is available in the current environment.
     * Handles cases where localStorage might be disabled or unavailable.
     * @returns True if localStorage is accessible and functional
     */
    static isAvailable(): boolean {
        try {
            const testKey = '__codecombat_storage_test__';
            window.localStorage.setItem(testKey, 'test');
            window.localStorage.removeItem(testKey);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Retrieve the user's game progress from localStorage.
     * Returns default progress if none exists or if storage is unavailable.
     * @returns The stored progress or default progress
     */
    static getProgress(): StoredProgress {
        if (!this.isAvailable()) {
            console.warn('LocalStorage not available, returning default progress');
            return { ...DEFAULT_PROGRESS };
        }

        try {
            const stored = window.localStorage.getItem(STORAGE_KEYS.PROGRESS);

            if (!stored) {
                return { ...DEFAULT_PROGRESS };
            }

            const parsed = JSON.parse(stored) as StoredProgress;

            // Merge with defaults to handle any missing fields from older versions
            return {
                ...DEFAULT_PROGRESS,
                ...parsed,
                settings: {
                    ...DEFAULT_SETTINGS,
                    ...parsed.settings,
                },
            };
        } catch (error) {
            console.error('Failed to parse stored progress:', error);
            return { ...DEFAULT_PROGRESS };
        }
    }

    /**
     * Save the user's game progress to localStorage.
     * Updates the lastPlayedAt timestamp automatically.
     * @param progress - The progress object to save
     * @returns True if save was successful, false otherwise
     */
    static saveProgress(progress: StoredProgress): boolean {
        if (!this.isAvailable()) {
            console.warn('LocalStorage not available, progress not saved');
            return false;
        }

        try {
            const updatedProgress: StoredProgress = {
                ...progress,
                lastPlayedAt: new Date().toISOString(),
            };

            window.localStorage.setItem(
                STORAGE_KEYS.PROGRESS,
                JSON.stringify(updatedProgress)
            );

            return true;
        } catch (error) {
            console.error('Failed to save progress:', error);
            return false;
        }
    }

    /**
     * Get saved code for a specific level.
     * @param levelId - The ID of the level
     * @returns The saved code string or null if none exists
     */
    static getLevelCode(levelId: string): string | null {
        if (!this.isAvailable()) {
            return null;
        }

        try {
            const key = `${STORAGE_KEYS.LEVEL_CODE_PREFIX}${levelId}`;
            return window.localStorage.getItem(key);
        } catch (error) {
            console.error(`Failed to get code for level ${levelId}:`, error);
            return null;
        }
    }

    /**
     * Save code for a specific level.
     * @param levelId - The ID of the level
     * @param code - The code string to save
     * @returns True if save was successful, false otherwise
     */
    static saveLevelCode(levelId: string, code: string): boolean {
        if (!this.isAvailable()) {
            console.warn('LocalStorage not available, code not saved');
            return false;
        }

        try {
            const key = `${STORAGE_KEYS.LEVEL_CODE_PREFIX}${levelId}`;
            window.localStorage.setItem(key, code);
            return true;
        } catch (error) {
            console.error(`Failed to save code for level ${levelId}:`, error);
            return false;
        }
    }

    /**
     * Clear saved code for a specific level.
     * @param levelId - The ID of the level
     * @returns True if clear was successful, false otherwise
     */
    static clearLevelCode(levelId: string): boolean {
        if (!this.isAvailable()) {
            return false;
        }

        try {
            const key = `${STORAGE_KEYS.LEVEL_CODE_PREFIX}${levelId}`;
            window.localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Failed to clear code for level ${levelId}:`, error);
            return false;
        }
    }

    /**
     * Get user settings from storage.
     * @returns User settings or defaults
     */
    static getSettings(): UserSettings {
        const progress = this.getProgress();
        return progress.settings;
    }

    /**
     * Update user settings.
     * @param settings - Partial settings to update
     * @returns True if save was successful
     */
    static updateSettings(settings: Partial<UserSettings>): boolean {
        const progress = this.getProgress();
        progress.settings = {
            ...progress.settings,
            ...settings,
        };
        return this.saveProgress(progress);
    }

    /**
     * Clear all game data from localStorage.
     * Use with caution - this cannot be undone!
     * @returns True if clear was successful
     */
    static clearAllData(): boolean {
        if (!this.isAvailable()) {
            return false;
        }

        try {
            // Clear progress
            window.localStorage.removeItem(STORAGE_KEYS.PROGRESS);
            window.localStorage.removeItem(STORAGE_KEYS.SETTINGS);
            window.localStorage.removeItem(STORAGE_KEYS.SESSION);
            window.localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);

            // Clear all level codes
            const keysToRemove: string[] = [];
            for (let i = 0; i < window.localStorage.length; i++) {
                const key = window.localStorage.key(i);
                if (key?.startsWith(STORAGE_KEYS.LEVEL_CODE_PREFIX)) {
                    keysToRemove.push(key);
                }
            }

            keysToRemove.forEach(key => {
                window.localStorage.removeItem(key);
            });

            return true;
        } catch (error) {
            console.error('Failed to clear all data:', error);
            return false;
        }
    }
}
