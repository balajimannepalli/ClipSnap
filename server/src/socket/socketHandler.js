import bcrypt from 'bcrypt';
import Clip from '../models/Clip.js';

const MAX_SIZE_BYTES = 100 * 1024; // 100 KB
const DEBOUNCE_MS = 1500;

// Validate clipboardId format (4-5 digit numeric) to prevent injection
const CLIPBOARD_ID_REGEX = /^[0-9]{4,5}$/;

// Track room state and debounce timers
const roomState = new Map();
const debounceTimers = new Map();
const socketCreators = new Map(); // socketId -> { clipboardId, isCreator }

/**
 * Setup Socket.IO handlers
 * @param {import('socket.io').Server} io 
 */
export function setupSocketHandlers(io) {
    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        /**
         * join-room event
         * Payload: { clipboardId, clientType?: 'creator'|'viewer', creatorToken?: string }
         */
        socket.on('join-room', async (payload) => {
            try {
                const { clipboardId, creatorToken } = payload;

                if (!clipboardId) {
                    socket.emit('error', { message: 'clipboardId is required' });
                    return;
                }

                // Validate clipboardId format
                if (!CLIPBOARD_ID_REGEX.test(clipboardId)) {
                    socket.emit('error', { message: 'Invalid clipboard ID format' });
                    return;
                }

                // Find the clip
                const clip = await Clip.findOne({ clipboardId });

                if (!clip) {
                    socket.emit('error', { message: 'Clip not found or expired' });
                    return;
                }

                // Verify creator token if provided
                let isCreator = false;
                if (creatorToken) {
                    isCreator = await bcrypt.compare(creatorToken, clip.creatorTokenHash);
                }

                // Join the room
                socket.join(clipboardId);

                // Track socket state
                socketCreators.set(socket.id, { clipboardId, isCreator });

                // Initialize room state if needed
                if (!roomState.has(clipboardId)) {
                    roomState.set(clipboardId, {
                        content: clip.content,
                        lastUpdated: clip.lastUpdated,
                        connectedClients: new Set()
                    });
                }
                roomState.get(clipboardId).connectedClients.add(socket.id);

                // No TTL reset - clips expire 15 min after creation only

                // Send room data to the joining client
                socket.emit('room-data', {
                    clipboardId,
                    content: clip.content,
                    isCreator,
                    lastUpdated: clip.lastUpdated
                });

                console.log(`Socket ${socket.id} joined room ${clipboardId} as ${isCreator ? 'creator' : 'viewer'}`);

            } catch (error) {
                console.error('Error in join-room:', error);
                socket.emit('error', { message: 'Failed to join room' });
            }
        });

        /**
         * client-edit event
         * Payload: { clipboardId, fullText, clientTimestamp }
         * Only accepted from creator sockets
         */
        socket.on('client-edit', async (payload) => {
            try {
                const { clipboardId, fullText, clientTimestamp } = payload;
                const socketState = socketCreators.get(socket.id);

                // Verify socket is in the correct room and is creator
                if (!socketState || socketState.clipboardId !== clipboardId) {
                    socket.emit('error', { message: 'Not in this room' });
                    return;
                }

                if (!socketState.isCreator) {
                    socket.emit('error', { message: 'Only the creator can edit' });
                    return;
                }

                // Validate content size
                const sizeBytes = Buffer.byteLength(fullText || '', 'utf8');
                if (sizeBytes > MAX_SIZE_BYTES) {
                    socket.emit('error', {
                        message: 'Content too large. Maximum size is 100KB.',
                        code: 'PAYLOAD_TOO_LARGE'
                    });
                    return;
                }

                // Update room state
                const room = roomState.get(clipboardId);
                if (room) {
                    room.content = fullText;
                    room.lastUpdated = new Date();
                }

                // Broadcast to all clients in the room
                const serverTimestamp = Date.now();
                io.to(clipboardId).emit('server-edit', {
                    clipboardId,
                    fullText,
                    serverTimestamp
                });

                // Debounced persistence
                debouncedSave(clipboardId, fullText);

            } catch (error) {
                console.error('Error in client-edit:', error);
                socket.emit('error', { message: 'Failed to process edit' });
            }
        });

        /**
         * leave-room event
         */
        socket.on('leave-room', () => {
            handleDisconnect(socket);
        });

        /**
         * disconnect event
         */
        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
            handleDisconnect(socket);
        });
    });
}

/**
 * Handle socket disconnect - clean up and force save
 */
async function handleDisconnect(socket) {
    const socketState = socketCreators.get(socket.id);

    if (socketState) {
        const { clipboardId, isCreator } = socketState;

        // Remove from room state
        const room = roomState.get(clipboardId);
        if (room) {
            room.connectedClients.delete(socket.id);

            // If creator disconnected and there's pending content, force save
            if (isCreator && room.content !== undefined) {
                await forceSave(clipboardId, room.content);
            }

            // Clean up room if no clients
            if (room.connectedClients.size === 0) {
                roomState.delete(clipboardId);

                // Clear any pending debounce timer
                if (debounceTimers.has(clipboardId)) {
                    clearTimeout(debounceTimers.get(clipboardId));
                    debounceTimers.delete(clipboardId);
                }
            }
        }

        socketCreators.delete(socket.id);
        socket.leave(clipboardId);
    }
}

/**
 * Debounced save - waits 1500ms after last edit before persisting
 */
function debouncedSave(clipboardId, content) {
    // Clear existing timer
    if (debounceTimers.has(clipboardId)) {
        clearTimeout(debounceTimers.get(clipboardId));
    }

    // Set new timer
    const timer = setTimeout(async () => {
        await persistToDatabase(clipboardId, content);
        debounceTimers.delete(clipboardId);
    }, DEBOUNCE_MS);

    debounceTimers.set(clipboardId, timer);
}

/**
 * Force save immediately (used on disconnect)
 */
async function forceSave(clipboardId, content) {
    // Clear any pending debounce
    if (debounceTimers.has(clipboardId)) {
        clearTimeout(debounceTimers.get(clipboardId));
        debounceTimers.delete(clipboardId);
    }

    await persistToDatabase(clipboardId, content);
}

/**
 * Persist content to database
 */
async function persistToDatabase(clipboardId, content) {
    try {
        await Clip.updateContent(clipboardId, content);
        console.log(`Persisted clip ${clipboardId} to database`);
    } catch (error) {
        console.error(`Failed to persist clip ${clipboardId}:`, error);
    }
}

export default setupSocketHandlers;
