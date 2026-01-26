const API_BASE = import.meta.env.VITE_SERVER_URL || '';

/**
 * Create a new clip
 * @param {string} content - The clip content
 * @returns {Promise<{clipboardId: string, creatorToken: string, url: string}>}
 */
export async function createClip(content) {
    const response = await fetch(`${API_BASE}/api/clip`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Failed to create clip: ${response.status}`);
    }

    return response.json();
}

/**
 * Get clip content
 * @param {string} clipboardId - The clipboard ID
 * @returns {Promise<{clipboardId: string, content: string, lastUpdated: string, meta: object}>}
 */
export async function getClip(clipboardId) {
    const response = await fetch(`${API_BASE}/api/clip/${clipboardId}`);

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Clip not found or expired');
        }
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Failed to fetch clip: ${response.status}`);
    }

    return response.json();
}

/**
 * Get clip metadata
 * @param {string} clipboardId - The clipboard ID
 * @returns {Promise<{clipboardId: string, sizeBytes: number, lastUpdated: string}>}
 */
export async function getClipMeta(clipboardId) {
    const response = await fetch(`${API_BASE}/api/clip/${clipboardId}/meta`);

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Failed to fetch clip metadata: ${response.status}`);
    }

    return response.json();
}

/**
 * Edit clip content (HTTP fallback)
 * @param {string} clipboardId - The clipboard ID
 * @param {string} content - New content
 * @param {string} creatorToken - Creator token for auth
 * @returns {Promise<{clipboardId: string, content: string, lastUpdated: string}>}
 */
export async function editClip(clipboardId, content, creatorToken) {
    const response = await fetch(`${API_BASE}/api/clip/${clipboardId}/edit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${creatorToken}`
        },
        body: JSON.stringify({ content })
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Failed to edit clip: ${response.status}`);
    }

    return response.json();
}
