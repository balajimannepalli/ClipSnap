import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
    const [clipId, setClipId] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const id = clipId.trim();

        if (!id) {
            setError('Please enter a clipboard ID');
            return;
        }

        // Basic validation: alphanumeric only
        if (!/^[a-zA-Z0-9]+$/.test(id)) {
            setError('Invalid clipboard ID format');
            return;
        }

        navigate(`/clip/${id}`);
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-16 md:py-24">
            {/* Hero Section */}
            <div className="text-center mb-16 animate-fade-in">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                    <span className="gradient-text">Share text instantly</span>
                </h1>
                <p className="text-lg md:text-xl text-dark-400 max-w-xl mx-auto">
                    Create a clip, share the ID, and paste anywhere.
                    <span className="text-dark-300"> No signup required.</span>
                </p>
            </div>

            {/* Main Actions */}
            <div className="grid gap-8 md:grid-cols-2 animate-slide-up">
                {/* Fetch Clip Card */}
                <div className="card glow-primary">
                    <h2 className="text-xl font-semibold text-dark-100 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Access a Clip
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="clipId" className="sr-only">Clipboard ID</label>
                            <input
                                type="text"
                                id="clipId"
                                value={clipId}
                                onChange={(e) => {
                                    setClipId(e.target.value);
                                    setError('');
                                }}
                                placeholder="Enter clipboard ID (e.g., abc123)"
                                className="w-full text-center text-lg font-mono tracking-wider"
                                autoComplete="off"
                                autoCapitalize="off"
                                spellCheck="false"
                            />
                            {error && (
                                <p className="mt-2 text-sm text-red-400" role="alert">{error}</p>
                            )}
                        </div>
                        <button type="submit" className="btn-primary w-full">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            Go / Fetch
                        </button>
                    </form>
                    <p className="mt-4 text-sm text-dark-500 text-center">
                        Content will be automatically copied to your clipboard
                    </p>
                </div>

                {/* Create Clip Card */}
                <div className="card border-primary-500/30 hover:border-primary-500/50 transition-colors">
                    <h2 className="text-xl font-semibold text-dark-100 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Clip
                    </h2>
                    <p className="text-dark-400 mb-6">
                        Paste or type your text, save it, and get a shareable clipboard ID.
                        Only you can edit your clip.
                    </p>
                    <button
                        onClick={() => navigate('/create')}
                        className="btn-primary w-full"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Create New Clip
                    </button>
                </div>
            </div>

            {/* Features */}
            <div className="mt-16 grid grid-cols-3 gap-4 text-center animate-fade-in">
                <div className="p-4">
                    <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-primary-500/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-sm text-dark-400">15-min auto-expire</p>
                </div>
                <div className="p-4">
                    <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-primary-500/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <p className="text-sm text-dark-400">Real-time sync</p>
                </div>
                <div className="p-4">
                    <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-primary-500/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <p className="text-sm text-dark-400">No signup</p>
                </div>
            </div>
        </div>
    );
}
