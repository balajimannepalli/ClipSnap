import { useState, useEffect } from 'react';

const TTL_SECONDS = 15 * 60; // 15 minutes

/**
 * Real-time expiry countdown component
 * @param {{ createdAt: string, className?: string }} props 
 */
export default function ExpiryCountdown({ createdAt, className = '' }) {
    const [remaining, setRemaining] = useState(null);

    useEffect(() => {
        if (!createdAt) return;

        const updateRemaining = () => {
            const created = new Date(createdAt).getTime();
            const expiresAt = created + (TTL_SECONDS * 1000);
            const now = Date.now();
            const remainingMs = Math.max(0, expiresAt - now);
            setRemaining(remainingMs);
        };

        // Initial update
        updateRemaining();

        // Update every second
        const interval = setInterval(updateRemaining, 1000);

        return () => clearInterval(interval);
    }, [createdAt]);

    if (remaining === null) return null;

    // Format remaining time
    const totalSeconds = Math.floor(remaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    // Determine color based on remaining time
    let colorClass = 'text-dark-400';
    if (minutes < 2) {
        colorClass = 'text-red-400';
    } else if (minutes < 5) {
        colorClass = 'text-accent-400';
    }

    // Expired
    if (remaining <= 0) {
        return (
            <span className={`${className} text-red-400 font-medium`}>
                Expired
            </span>
        );
    }

    return (
        <span className={`${className} ${colorClass} flex items-center gap-1.5`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
                Expires in {minutes > 0 ? `${minutes}m ` : ''}{seconds}s
            </span>
        </span>
    );
}
