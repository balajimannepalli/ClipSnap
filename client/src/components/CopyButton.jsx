import { useState } from 'react';
import { useClipboard } from '../hooks/useClipboard';

/**
 * Copy button with visual feedback
 * @param {{ text: string, onSuccess?: function, onError?: function, className?: string, large?: boolean }} props 
 */
export default function CopyButton({ text, onSuccess, onError, className = '', large = false }) {
    const { copyToClipboard, copying } = useClipboard();
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        const success = await copyToClipboard(text);

        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            onSuccess?.();
        } else {
            onError?.();
        }
    };

    const sizeClasses = large
        ? 'px-8 py-4 text-lg'
        : 'px-4 py-2 text-sm';

    return (
        <button
            onClick={handleCopy}
            disabled={copying || !text}
            className={`
                inline-flex items-center justify-center gap-2 font-medium
                transition-all duration-200 
                ${copied
                    ? 'bg-[var(--color-accent)] text-[var(--color-bg)]'
                    : 'bg-themed-surface text-themed border border-themed hover:border-[var(--color-border-hover)]'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]
                ${sizeClasses}
                ${className}
            `}
            style={{ borderRadius: 'var(--radius-card)' }}
            aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
        >
            {copying ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            ) : copied ? (
                <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                </>
            ) : (
                <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy
                </>
            )}
        </button>
    );
}
