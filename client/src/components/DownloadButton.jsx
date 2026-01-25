/**
 * Download button component
 * @param {{ content: string, filename: string, className?: string }} props 
 */
export default function DownloadButton({ content, filename, className = '' }) {
    const handleDownload = () => {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    return (
        <button
            onClick={handleDownload}
            disabled={!content}
            className={`
        inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg 
        font-medium text-sm transition-all duration-200
        bg-dark-800 text-dark-100 border border-dark-600 
        hover:bg-dark-700 hover:border-dark-500
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-950
        ${className}
      `}
            aria-label={`Download as ${filename}`}
        >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download .txt
        </button>
    );
}
