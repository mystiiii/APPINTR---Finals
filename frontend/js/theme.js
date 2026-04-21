/**
 * TimeSync — Theme Toggle Module
 * Persists the user's light/dark preference in localStorage and applies
 * data-theme="light|dark" on the <html> element.
 *
 * This script should be loaded BEFORE the body renders (in <head>)
 * to prevent a flash of wrong theme.
 */

(function () {
    'use strict';

    var STORAGE_KEY = 'ts-theme';

    /**
     * Determine initial theme.
     * Priority: localStorage → OS preference → dark (default).
     */
    function getInitialTheme() {
        var stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') return stored;

        // Check OS preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }
        return 'dark';
    }

    /** Apply theme to <html> and update toggle icon visibility (via CSS). */
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);
    }

    /** Toggle between light and dark. */
    function toggleTheme() {
        var current = document.documentElement.getAttribute('data-theme') || 'dark';
        var next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
    }

    // Apply immediately (blocks render, prevents flash)
    applyTheme(getInitialTheme());

    // Expose for the toggle button
    window.tsTheme = {
        toggle: toggleTheme,
        get: function () {
            return document.documentElement.getAttribute('data-theme') || 'dark';
        },
        set: applyTheme,
    };
})();
