import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClip } from '../utils/api';
import { getCreatorToken } from '../utils/storage';
import { useClipboard } from '../hooks/useClipboard';
import { useSocket } from '../hooks/useSocket';
import { useToast } from '../context/ToastContext';
import CopyButton from '../components/CopyButton';
import DownloadButton from '../components/DownloadButton';
import ExpiryCountdown from '../components/ExpiryCountdown';

const MAX_SIZE_BYTES = 100 * 1024;

export default function ClipView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { copyToClipboard } = useClipboard();

    const [content, setContent] = useState('');
    const [lastUpdated, setLastUpdated] = useState(null);
    const [createdAt, setCreatedAt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [autoCopied, setAutoCopied] = useState(false);

    // Get creator token from localStorage
    const creatorToken = getCreatorToken(id);

    // Content update handler for socket
    const handleContentUpdate = useCallback((newContent, timestamp) => {
        setContent(newContent);
        setLastUpdated(timestamp);
    }, []);

    // Socket connection
    const { isConnected, isCreator, emitEdit, error: socketError } = useSocket(
        id,
        creatorToken,
        handleContentUpdate
    );

    // Fetch initial clip data
    useEffect(() => {
        const fetchClip = async () => {
            try {
                setLoading(true);
                const data = await getClip(id);
                setContent(data.content);
                setLastUpdated(data.lastUpdated);
                setCreatedAt(data.createdAt);
                setError(null);

                // Auto-copy for viewers (not creators)
                if (!creatorToken && data.content) {
                    // Try auto-copy - might fail without user gesture
                    const attemptCopy = async () => {
                        try {
                            // Check if document is focused (helps with browser restrictions)
                            if (document.hasFocus()) {
                                const success = await copyToClipboard(data.content);
                                if (success) {
                                    setAutoCopied(true);
                                    showToast('Copied to clipboard — ready to paste!', 'success', 4000);
                                    return true;
                                }
                            }
                            return false;
                        } catch (err) {
                            console.error('Auto-copy failed:', err);
                            return false;
                        }
                    };

                    // Try immediately
                    const copied = await attemptCopy();

                    // If failed, try again when window gets focus
                    if (!copied) {
                        showToast('Click anywhere to copy content to clipboard', 'info', 4000);

                        // One-time click handler to copy on first interaction
                        const handleClick = async () => {
                            const success = await copyToClipboard(data.content);
                            if (success) {
                                setAutoCopied(true);
                                showToast('Copied to clipboard!', 'success');
                            }
                            document.removeEventListener('click', handleClick);
                        };
                        document.addEventListener('click', handleClick, { once: true });
                    }
                }

            } catch (err) {
                console.error('Failed to fetch clip:', err);
                setError(err.message || 'Failed to load clip');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchClip();
        }
    }, [id, creatorToken, copyToClipboard, showToast]);

    // Handle content change (creator only)
    const handleContentChange = (e) => {
        const newContent = e.target.value;

        // Check size limit
        const sizeBytes = new Blob([newContent]).size;
        if (sizeBytes > MAX_SIZE_BYTES) {
            showToast('Content exceeds 100KB limit', 'error');
            return;
        }

        setContent(newContent);
        emitEdit(newContent);
    };

    // Format relative time
    const formatTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffSecs = Math.floor(diffMs / 1000);

        if (diffSecs < 60) return 'just now';
        if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
        if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    // Loading state
    if (loading) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center">
                <div className="animate-pulse">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-800 flex items-center justify-center">
                        <svg className="w-8 h-8 text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    </div>
                    <p className="text-dark-400">Loading clip...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-dark-100 mb-2">Clip Not Found</h2>
                <p className="text-dark-400 mb-6">{error}</p>
                <button onClick={() => navigate('/')} className="btn-primary">
                    Go Home
                </button>
            </div>
        );
    }

    const sizeBytes = new Blob([content]).size;

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-xl md:text-2xl font-bold text-dark-100 font-mono">
                            {id}
                        </h1>
                        {isCreator && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-primary-500/20 text-primary-400 rounded-full">
                                Creator
                            </span>
                        )}
                        {!isCreator && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-dark-700 text-dark-400 rounded-full">
                                Read-only
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-dark-500">
                        <span className={`flex items-center gap-1 ${isConnected ? 'text-primary-400' : 'text-dark-500'}`}>
                            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-primary-500' : 'bg-dark-600'}`} />
                            {isConnected ? 'Live' : 'Offline'}
                        </span>
                        {createdAt && (
                            <ExpiryCountdown createdAt={createdAt} />
                        )}
                    </div>
                </div>

                {/* Share Code */}
                <div className="flex items-center gap-3">
                    <span className="text-dark-400 text-sm">Code:</span>
                    <span className="text-2xl font-bold font-mono text-primary-400 tracking-wider">{id}</span>
                    <CopyButton
                        text={id}
                        onSuccess={() => showToast('Code copied!', 'success')}
                    />
                </div>
            </div>

            {/* Auto-copy success banner (for viewers) */}
            {autoCopied && !isCreator && (
                <div className="mb-6 p-4 bg-primary-500/10 border border-primary-500/30 rounded-lg flex items-center gap-3">
                    <svg className="w-5 h-5 text-primary-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-primary-300 text-sm">
                        <strong>Copied to clipboard</strong> — ready to paste!
                    </p>
                </div>
            )}

            {/* Socket error */}
            {socketError && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{socketError}</p>
                </div>
            )}

            {/* Content Area */}
            <div className="card mb-6">
                {isCreator ? (
                    // Creator: Editable textarea
                    <div>
                        <label htmlFor="content" className="sr-only">Edit clip content</label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={handleContentChange}
                            className="w-full h-64 md:h-96 text-sm"
                            placeholder="Start typing..."
                        />
                        <div className="mt-3 flex items-center justify-between text-sm text-dark-500">
                            <span>{(sizeBytes / 1024).toFixed(1)} KB / 100 KB</span>
                            <span>{content.length.toLocaleString()} characters</span>
                        </div>
                    </div>
                ) : (
                    // Viewer: Read-only code block
                    <div>
                        <pre className="code-block min-h-[200px] max-h-[600px] overflow-auto">
                            <code>{content || 'No content'}</code>
                        </pre>
                        <div className="mt-3 text-sm text-dark-500">
                            {content.length.toLocaleString()} characters
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
                <CopyButton
                    text={content}
                    large
                    onSuccess={() => showToast('Copied to clipboard!', 'success')}
                    onError={() => showToast('Failed to copy', 'error')}
                />
                <DownloadButton content={content} filename={`${id}.txt`} />
            </div>

            {/* Copy fallback for blocked clipboard */}
            {!autoCopied && !isCreator && content && (
                <div className="mt-8 p-4 bg-dark-900/50 rounded-lg border border-dark-800">
                    <p className="text-sm text-dark-400 mb-3">
                        If automatic copy didn't work, select the text above or use the Copy button.
                    </p>
                    <CopyButton
                        text={content}
                        className="w-full sm:w-auto"
                        onSuccess={() => {
                            setAutoCopied(true);
                            showToast('Copied to clipboard!', 'success');
                        }}
                    />
                </div>
            )}
        </div>
    );
}
