import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeProvider';

/**
 * Theme Toggle Component
 * 
 * Features:
 * - Sun/Moon icon toggle (classic design)
 * - Smooth rotation/scale animation between icons using framer-motion
 * - Triggers View Transitions API for page-wide animation via toggleTheme
 * - Fully accessible with keyboard support
 */
export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            className="relative w-10 h-10 flex items-center justify-center rounded-lg 
                       transition-all duration-200 
                       hover:bg-[var(--color-border)] 
                       focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {/* Sun icon - shown in dark mode (click to go light) */}
            <motion.svg
                className="w-5 h-5 absolute text-[var(--color-text)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                initial={false}
                animate={{
                    opacity: isDark ? 1 : 0,
                    rotate: isDark ? 0 : 90,
                    scale: isDark ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
            >
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </motion.svg>

            {/* Moon icon - shown in light mode (click to go dark) */}
            <motion.svg
                className="w-5 h-5 absolute text-[var(--color-text)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                initial={false}
                animate={{
                    opacity: !isDark ? 1 : 0,
                    rotate: !isDark ? 0 : -90,
                    scale: !isDark ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
            >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </motion.svg>
        </button>
    );
}
