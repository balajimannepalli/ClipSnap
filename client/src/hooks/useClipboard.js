import { useState, useCallback } from 'react';

/**
 * Custom hook for clipboard operations with fallback
 * @returns {{ copyToClipboard: (text: string) => Promise<boolean>, copying: boolean, error: string|null }}
 */
export function useClipboard() {
    const [copying, setCopying] = useState(false);
    const [error, setError] = useState(null);

    const copyToClipboard = useCallback(async (text) => {
        setCopying(true);
        setError(null);

        try {
            // Try modern Clipboard API first
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                setCopying(false);
                return true;
            }

            // Fallback: execCommand
            const success = fallbackCopy(text);
            if (!success) {
                throw new Error('Clipboard write failed');
            }

            setCopying(false);
            return true;

        } catch (err) {
            console.error('Clipboard error:', err);

            // Try fallback
            const success = fallbackCopy(text);
            if (success) {
                setCopying(false);
                return true;
            }

            setError('Unable to copy to clipboard. Please copy manually.');
            setCopying(false);
            return false;
        }
    }, []);

    return { copyToClipboard, copying, error };
}

/**
 * Fallback copy using execCommand
 * @param {string} text 
 * @returns {boolean}
 */
function fallbackCopy(text) {
    try {
        const textArea = document.createElement('textarea');
        textArea.value = text;

        // Prevent scrolling
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const success = document.execCommand('copy');
        document.body.removeChild(textArea);

        return success;
    } catch (err) {
        console.error('Fallback copy failed:', err);
        return false;
    }
}

export default useClipboard;
