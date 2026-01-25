import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClip } from '../utils/api';
import { saveCreatorToken } from '../utils/storage';
import { useToast } from '../context/ToastContext';
import { useClipboard } from '../hooks/useClipboard';

const MAX_SIZE_BYTES = 100 * 1024; // 100 KB

export default function CreateClip() {
    const [content, setContent] = useState('');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { copyToClipboard } = useClipboard();

    const sizeBytes = new Blob([content]).size;
    const sizePercent = Math.min((sizeBytes / MAX_SIZE_BYTES) * 100, 100);
    const isOverLimit = sizeBytes > MAX_SIZE_BYTES;

    const handleCreate = async () => {
        if (!content.trim()) {
            setError('Please enter some content');
            return;
        }

        if (isOverLimit) {
            setError('Content exceeds 100KB limit');
            return;
        }

        setCreating(true);
        setError('');

        try {
            const result = await createClip(content);

            // Store creator token
            saveCreatorToken(result.clipboardId, result.creatorToken);

            // Auto-copy the clip ID to clipboard
            try {
                await copyToClipboard(result.clipboardId);
                showToast(`Clip created! Code "${result.clipboardId}" copied to clipboard`, 'success', 4000);
            } catch (err) {
                showToast('Clip created successfully!', 'success');
            }

            // Navigate to clip view
            navigate(`/clip/${result.clipboardId}`);

        } catch (err) {
            console.error('Failed to create clip:', err);
            setError(err.message || 'Failed to create clip. Please try again.');
            showToast('Failed to create clip', 'error');
        } finally {
            setCreating(false);
        }
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        return `${(bytes / 1024).toFixed(1)} KB`;
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
            <div className="animate-fade-in">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-dark-100 mb-2">
                        Create New Clip
                    </h1>
                    <p className="text-dark-400">
                        Paste or type your text below. You'll receive a unique clipboard ID to share.
                    </p>
                </div>

                {/* Editor Card */}
                <div className="card">
                    {/* Textarea */}
                    <div className="relative">
                        <label htmlFor="content" className="sr-only">Clip content</label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => {
                                setContent(e.target.value);
                                setError('');
                            }}
                            placeholder="Paste or type your text here..."
                            className={`w-full h-64 md:h-96 ${isOverLimit ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                            autoFocus
                        />
                    </div>

                    {/* Size indicator */}
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex-1 max-w-xs">
                            <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 ${isOverLimit ? 'bg-red-500' : sizePercent > 80 ? 'bg-accent-500' : 'bg-primary-500'
                                        }`}
                                    style={{ width: `${sizePercent}%` }}
                                />
                            </div>
                            <p className={`mt-1 text-xs ${isOverLimit ? 'text-red-400' : 'text-dark-500'}`}>
                                {formatSize(sizeBytes)} / {formatSize(MAX_SIZE_BYTES)}
                                {isOverLimit && ' — Content too large'}
                            </p>
                        </div>

                        <p className="text-sm text-dark-500">
                            {content.length.toLocaleString()} characters
                        </p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handleCreate}
                            disabled={creating || !content.trim() || isOverLimit}
                            className="btn-primary flex-1"
                        >
                            {creating ? (
                                <>
                                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Create Clip
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => setContent('')}
                            disabled={!content || creating}
                            className="btn-secondary"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                {/* Info */}
                <div className="mt-8 p-4 bg-dark-900/50 rounded-lg border border-dark-800">
                    <h3 className="text-sm font-medium text-dark-300 mb-2">How it works:</h3>
                    <ul className="text-sm text-dark-500 space-y-1">
                        <li>• You'll receive a unique clipboard ID after creating</li>
                        <li>• Share the ID with others to let them view and copy the content</li>
                        <li>• Only you can edit the clip (your browser stores the edit key)</li>
                        <li>• Clips automatically expire 15 minutes after last access</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
