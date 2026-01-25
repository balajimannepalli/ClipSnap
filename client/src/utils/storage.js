const STORAGE_PREFIX = 'clipsnap_token_';

/**
 * Save creator token for a clipboard
 * @param {string} clipboardId 
 * @param {string} token 
 */
export function saveCreatorToken(clipboardId, token) {
    try {
        localStorage.setItem(`${STORAGE_PREFIX}${clipboardId}`, token);
    } catch (error) {
        console.error('Failed to save token to localStorage:', error);
    }
}

/**
 * Get creator token for a clipboard
 * @param {string} clipboardId 
 * @returns {string|null}
 */
export function getCreatorToken(clipboardId) {
    try {
        return localStorage.getItem(`${STORAGE_PREFIX}${clipboardId}`);
    } catch (error) {
        console.error('Failed to get token from localStorage:', error);
        return null;
    }
}

/**
 * Remove creator token for a clipboard
 * @param {string} clipboardId 
 */
export function removeCreatorToken(clipboardId) {
    try {
        localStorage.removeItem(`${STORAGE_PREFIX}${clipboardId}`);
    } catch (error) {
        console.error('Failed to remove token from localStorage:', error);
    }
}

/**
 * Check if user has creator token for a clipboard
 * @param {string} clipboardId 
 * @returns {boolean}
 */
export function hasCreatorToken(clipboardId) {
    return !!getCreatorToken(clipboardId);
}

/**
 * Get all stored clipboard IDs
 * @returns {string[]}
 */
export function getAllStoredClipIds() {
    const ids = [];
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(STORAGE_PREFIX)) {
                ids.push(key.replace(STORAGE_PREFIX, ''));
            }
        }
    } catch (error) {
        console.error('Failed to read localStorage:', error);
    }
    return ids;
}
