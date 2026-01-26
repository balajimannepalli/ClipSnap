import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = (import.meta.env.VITE_SERVER_URL || '').replace(/\/$/, '');

/**
 * Custom hook for Socket.IO connection and room management
 * @param {string} clipboardId 
 * @param {string|null} creatorToken 
 * @param {function} onContentUpdate - Callback when content updates from server
 * @returns {{ socket: Socket, isConnected: boolean, isCreator: boolean, emitEdit: function, error: string|null }}
 */
export function useSocket(clipboardId, creatorToken, onContentUpdate) {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isCreator, setIsCreator] = useState(false);
    const [error, setError] = useState(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        if (!clipboardId) return;

        // Create socket connection
        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);
            setError(null);

            // Join room
            socket.emit('join-room', {
                clipboardId,
                creatorToken: creatorToken || undefined,
                clientType: creatorToken ? 'creator' : 'viewer'
            });
        });

        socket.on('room-data', (data) => {
            console.log('Received room data:', data);
            setIsCreator(data.isCreator);
            if (onContentUpdate) {
                onContentUpdate(data.content, data.lastUpdated);
            }
        });

        socket.on('server-edit', (data) => {
            console.log('Received server edit');
            if (onContentUpdate) {
                onContentUpdate(data.fullText, new Date(data.serverTimestamp).toISOString());
            }
        });

        socket.on('error', (data) => {
            console.error('Socket error:', data);
            setError(data.message);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        socket.on('connect_error', (err) => {
            console.error('Connection error:', err);
            setError('Failed to connect to server');
        });

        // Cleanup
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
            socket.emit('leave-room');
            socket.disconnect();
            socketRef.current = null;
        };
    }, [clipboardId, creatorToken, onContentUpdate]);

    /**
     * Emit edit with client-side debounce (300ms)
     */
    const emitEdit = useCallback((fullText) => {
        if (!socketRef.current || !isCreator) return;

        // Clear previous debounce
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // Debounce client-side (300ms) before sending
        debounceRef.current = setTimeout(() => {
            socketRef.current.emit('client-edit', {
                clipboardId,
                fullText,
                clientTimestamp: Date.now()
            });
        }, 300);
    }, [clipboardId, isCreator]);

    return {
        socket: socketRef.current,
        isConnected,
        isCreator,
        emitEdit,
        error
    };
}

export default useSocket;
