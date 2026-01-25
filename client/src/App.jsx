import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Landing from './pages/Landing';
import CreateClip from './pages/CreateClip';
import ClipView from './pages/ClipView';
import Toast from './components/Toast';
import { ToastContext } from './context/ToastContext';

function App() {
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success', duration = 3000) => {
        setToast({ message, type, duration });
    };

    const hideToast = () => {
        setToast(null);
    };

    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            <div className="min-h-screen flex flex-col">
                {/* Header */}
                <header className="border-b border-dark-800 bg-dark-950/80 backdrop-blur-sm sticky top-0 z-40">
                    <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <svg className="w-8 h-8 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="2" width="6" height="4" rx="1" ry="1" />
                                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                                <path d="M9 14l2 2 4-4" />
                            </svg>
                            <span className="text-xl font-semibold gradient-text">ClipSnap</span>
                        </a>
                        <nav className="flex items-center gap-4">
                            <a href="/create" className="btn-ghost text-sm">
                                Create Clip
                            </a>
                        </nav>
                    </div>
                </header>

                {/* Main content */}
                <main className="flex-1">
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/create" element={<CreateClip />} />
                        <Route path="/clip/:id" element={<ClipView />} />
                    </Routes>
                </main>

                {/* Footer */}
                <footer className="border-t border-dark-800 py-6 mt-auto">
                    <div className="max-w-5xl mx-auto px-4 text-center text-dark-500 text-sm">
                        <p>ClipSnap — Instant text sharing with automatic expiration</p>
                        <p className="mt-1 text-dark-600">Clips expire 15 minutes after last access</p>
                    </div>
                </footer>

                {/* Toast notifications */}
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        duration={toast.duration}
                        onClose={hideToast}
                    />
                )}
            </div>
        </ToastContext.Provider>
    );
}

export default App;
