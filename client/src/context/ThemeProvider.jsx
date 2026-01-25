import { createContext, useContext, useEffect, useState, useCallback } from 'react';

/**
 * Theme Context with View Transitions API
 * 
 * Features:
 * - Smooth animated theme transitions using View Transitions API
 * - Multiple animation variants (circle, rectangle, polygon)
 * - Falls back gracefully for unsupported browsers
 * - Persists choice to localStorage
 * - Respects system preference on first load
 */

const ThemeContext = createContext(null);

const STORAGE_KEY = 'clipsnap-theme';
const STYLE_ID = 'theme-transition-styles';

// Animation variant types
export const ANIMATION_VARIANTS = {
    CIRCLE: 'circle',
    RECTANGLE: 'rectangle',
    POLYGON: 'polygon',
};

export const ANIMATION_STARTS = {
    CENTER: 'center',
    TOP_LEFT: 'top-left',
    TOP_RIGHT: 'top-right',
    BOTTOM_LEFT: 'bottom-left',
    BOTTOM_RIGHT: 'bottom-right',
    BOTTOM_UP: 'bottom-up',
    TOP_DOWN: 'top-down',
};

/**
 * Creates CSS animation for view transitions
 */
const createAnimation = (variant, start = 'center', blur = false) => {
    if (variant === 'rectangle') {
        const getClipPath = (direction) => {
            switch (direction) {
                case 'bottom-up':
                    return {
                        from: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
                        to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                    };
                case 'top-down':
                    return {
                        from: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
                        to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                    };
                case 'top-left':
                    return {
                        from: 'polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)',
                        to: 'polygon(0% 0%, 200% 0%, 200% 200%, 0% 200%)',
                    };
                case 'top-right':
                    return {
                        from: 'polygon(100% 0%, 100% 0%, 100% 0%, 100% 0%)',
                        to: 'polygon(-100% 0%, 100% 0%, 100% 200%, -100% 200%)',
                    };
                default:
                    return {
                        from: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
                        to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                    };
            }
        };

        const clipPath = getClipPath(start);

        return {
            name: `rectangle-${start}`,
            css: `
                ::view-transition-group(root) {
                    animation-duration: 0.7s;
                    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
                }
                
                ::view-transition-new(root) {
                    animation-name: reveal-${start};
                    ${blur ? 'filter: blur(2px);' : ''}
                }

                ::view-transition-old(root),
                .dark::view-transition-old(root) {
                    animation: none;
                    z-index: -1;
                }

                .dark::view-transition-new(root) {
                    animation-name: reveal-${start};
                    ${blur ? 'filter: blur(2px);' : ''}
                }

                @keyframes reveal-${start} {
                    from {
                        clip-path: ${clipPath.from};
                        ${blur ? 'filter: blur(8px);' : ''}
                    }
                    ${blur ? '50% { filter: blur(4px); }' : ''}
                    to {
                        clip-path: ${clipPath.to};
                        ${blur ? 'filter: blur(0px);' : ''}
                    }
                }
            `,
        };
    }

    if (variant === 'circle') {
        const getClipPosition = (position) => {
            switch (position) {
                case 'top-left': return '0% 0%';
                case 'top-right': return '100% 0%';
                case 'bottom-left': return '0% 100%';
                case 'bottom-right': return '100% 100%';
                default: return '50% 50%';
            }
        };

        const clipPosition = getClipPosition(start);

        return {
            name: `circle-${start}`,
            css: `
                ::view-transition-group(root) {
                    animation-duration: 0.8s;
                    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
                }
                
                ::view-transition-new(root) {
                    animation-name: circle-reveal-${start};
                    ${blur ? 'filter: blur(2px);' : ''}
                }

                ::view-transition-old(root),
                .dark::view-transition-old(root) {
                    animation: none;
                    z-index: -1;
                }

                .dark::view-transition-new(root) {
                    animation-name: circle-reveal-${start};
                    ${blur ? 'filter: blur(2px);' : ''}
                }

                @keyframes circle-reveal-${start} {
                    from {
                        clip-path: circle(0% at ${clipPosition});
                        ${blur ? 'filter: blur(8px);' : ''}
                    }
                    ${blur ? '50% { filter: blur(4px); }' : ''}
                    to {
                        clip-path: circle(150% at ${clipPosition});
                        ${blur ? 'filter: blur(0px);' : ''}
                    }
                }
            `,
        };
    }

    if (variant === 'polygon') {
        const getPolygonClipPaths = (position) => {
            switch (position) {
                case 'top-left':
                    return {
                        from: 'polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)',
                        to: 'polygon(0% 0%, 200% 0%, 200% 200%, 0% 200%)',
                    };
                case 'top-right':
                    return {
                        from: 'polygon(100% 0%, 100% 0%, 100% 0%, 100% 0%)',
                        to: 'polygon(-100% -100%, 100% 0%, 200% 200%, -100% 200%)',
                    };
                default:
                    return {
                        from: 'polygon(50% -71%, -50% 71%, -50% 71%, 50% -71%)',
                        to: 'polygon(50% -71%, -50% 71%, 50% 171%, 171% 50%)',
                    };
            }
        };

        const clipPaths = getPolygonClipPaths(start);

        return {
            name: `polygon-${start}`,
            css: `
                ::view-transition-group(root) {
                    animation-duration: 0.7s;
                    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
                }
                
                ::view-transition-new(root) {
                    animation-name: polygon-reveal-${start};
                }

                ::view-transition-old(root),
                .dark::view-transition-old(root) {
                    animation: none;
                    z-index: -1;
                }

                .dark::view-transition-new(root) {
                    animation-name: polygon-reveal-${start};
                }

                @keyframes polygon-reveal-${start} {
                    from {
                        clip-path: ${clipPaths.from};
                    }
                    to {
                        clip-path: ${clipPaths.to};
                    }
                }
            `,
        };
    }

    // Default fallback
    return {
        name: 'default',
        css: `
            ::view-transition-group(root) {
                animation-duration: 0.5s;
            }
        `,
    };
};

/**
 * Injects transition styles into the document
 */
const updateStyles = (css) => {
    if (typeof window === 'undefined') return;

    let styleElement = document.getElementById(STYLE_ID);

    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = STYLE_ID;
        document.head.appendChild(styleElement);
    }

    styleElement.textContent = css;
};

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved === 'dark' || saved === 'light') {
                return saved;
            }
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        }
        return 'light';
    });

    // Animation settings
    const [animationVariant, setAnimationVariant] = useState('circle');
    const [animationStart, setAnimationStart] = useState('top-right');

    // Apply theme class to document
    useEffect(() => {
        const root = document.documentElement;

        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Update Favicon
        const link = document.querySelector("link[rel~='icon']");
        if (link) {
            link.href = theme === 'dark' ? '/clipboard-dark.svg' : '/clipboard-light.svg';
        }

        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    // Listen for system preference changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e) => {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) {
                setThemeState(e.matches ? 'dark' : 'light');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    /**
     * Toggle theme with View Transitions API animation
     */
    const toggleTheme = useCallback(() => {
        const animation = createAnimation(animationVariant, animationStart, false);
        updateStyles(animation.css);

        const switchTheme = () => {
            setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
        };

        // Check if View Transitions API is supported
        if (!document.startViewTransition) {
            switchTheme();
            return;
        }

        // Use View Transitions API for smooth animation
        document.startViewTransition(switchTheme);
    }, [animationVariant, animationStart]);

    const setTheme = (newTheme) => {
        if (newTheme === 'dark' || newTheme === 'light') {
            const animation = createAnimation(animationVariant, animationStart, false);
            updateStyles(animation.css);

            const switchTheme = () => {
                setThemeState(newTheme);
            };

            if (!document.startViewTransition) {
                switchTheme();
                return;
            }

            document.startViewTransition(switchTheme);
        }
    };

    return (
        <ThemeContext.Provider value={{
            theme,
            toggleTheme,
            setTheme,
            animationVariant,
            setAnimationVariant,
            animationStart,
            setAnimationStart,
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export default ThemeContext;
