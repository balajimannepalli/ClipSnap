/** @type {import('tailwindcss').Config} */
export default {
    // Enable class-based dark mode for theme toggle
    darkMode: 'class',

    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],

    theme: {
        extend: {
            colors: {
                // =====================================================
                // DARK THEME (Next.js Style)
                // Engineering-first, confident, calm, serious
                // =====================================================
                dark: {
                    bg: '#0a0a0a',           // Near-black with slight warmth
                    surface: '#111111',       // Cards/elevated surfaces
                    border: '#1f1f1f',        // Subtle borders
                    'border-hover': '#2a2a2a', // Border on hover
                    text: '#ffffff',          // Primary text
                    'text-secondary': '#a1a1a1', // Secondary text
                    'text-muted': '#737373',  // Muted/disabled text
                },

                // =====================================================
                // LIGHT THEME (Sustainable Fashion Style)
                // Premium, sustainable, calm, lifestyle-oriented
                // =====================================================
                light: {
                    bg: '#ffffff',            // Pure white
                    surface: '#f3f4f6',        // Light gray surface
                    border: '#e5e7eb',         // Gray-200
                    'border-hover': '#d1d5db', // Gray-300
                    text: '#000000',           // Pure black
                    'text-secondary': '#4b5563', // Gray-600
                    'text-muted': '#9ca3af',   // Gray-400
                },

                // =====================================================
                // ACCENT COLORS
                // =====================================================
                accent: {
                    // Light theme: muted olive green
                    olive: {
                        50: '#f4f6f1',
                        100: '#e8eddf',
                        200: '#d1dbbf',
                        300: '#b3c394',
                        400: '#95ab6e',
                        500: '#5c6b4a',  // Primary olive
                        600: '#4a5a3a',
                        700: '#3d4a30',
                        800: '#333d29',
                        900: '#2b3224',
                    },
                    // Light theme: earth/sand tones
                    sand: {
                        50: '#faf8f5',
                        100: '#f5f0e8',
                        200: '#e8ddd0',
                        300: '#d4c4ab',
                        400: '#bfa882',
                        500: '#8b7355',  // Primary sand
                        600: '#745f47',
                        700: '#5f4d3a',
                        800: '#4d3f30',
                        900: '#403429',
                    },
                },

                // Semantic colors (theme-aware via CSS variables)
                // These get overridden by CSS custom properties
                primary: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
                },
            },

            fontFamily: {
                // Sans-serif: Inter for both themes
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                // Monospace: for code blocks
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },

            // Border radius presets
            borderRadius: {
                // Dark theme: minimal/sharp
                'none': '0',
                'sm': '0.125rem',
                // Light theme: rounded/soft
                'soft': '0.75rem',
                'soft-lg': '1rem',
                'soft-xl': '1.5rem',
            },

            // Box shadows
            boxShadow: {
                // Light theme: soft, premium shadows
                'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
                'soft-md': '0 4px 16px rgba(0, 0, 0, 0.06)',
                'soft-lg': '0 8px 32px rgba(0, 0, 0, 0.08)',
                'soft-hover': '0 8px 24px rgba(0, 0, 0, 0.1)',
            },

            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
                'theme-switch': 'themeSwitch 0.3s ease-out',
            },

            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
                themeSwitch: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
            },
        },
    },

    plugins: [],
}
