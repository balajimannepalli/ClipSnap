import { useNavigate } from 'react-router-dom';

/**
 * Back Button Component
 * 
 * Renders a simple back button with an arrow icon.
 * Navigates to the previous page in history or fallback URL if provided.
 */
export default function BackButton({ to, label = 'Back', className = '' }) {
    const navigate = useNavigate();

    const handleBack = () => {
        if (to) {
            navigate(to);
        } else {
            navigate(-1);
        }
    };

    return (
        <button
            onClick={handleBack}
            className={`
                group inline-flex items-center gap-2 px-3 py-2 rounded-lg
                text-sm font-medium transition-all duration-200
                text-themed-secondary hover:text-themed
                hover:bg-themed-surface hover:border hover:border-themed
                focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]
                ${className}
            `}
            aria-label={label}
        >
            <svg
                className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>{label}</span>
        </button>
    );
}
