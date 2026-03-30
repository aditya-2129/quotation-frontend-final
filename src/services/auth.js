import { account, ID } from '@/lib/appwrite';

export const authService = {
    /**
     * Login with email + password. Creates a session cookie.
     */
    async login(email, password) {
        try {
            const session = await account.createEmailPasswordSession(email, password);
            return session;
        } catch (error) {
            console.error("Auth Service Error [login]:", error);
            throw error;
        }
    },

    /**
     * Logout the current user by deleting the active session.
     */
    async logout() {
        try {
            await account.deleteSession('current');
            return true;
        } catch (error) {
            console.error("Auth Service Error [logout]:", error);
            throw error;
        }
    },

    /**
     * Get the currently logged-in Appwrite auth user.
     * Returns null if no active session.
     */
    async getCurrentUser() {
        try {
            return await account.get();
        } catch (error) {
            // Not logged in — this is expected, not an error
            return null;
        }
    },

    /**
     * Create a new Appwrite auth account via server-side API (admin use only).
     * Uses the server SDK so the admin stays logged in.
     */
    async createAuthAccount(email, password, name) {
        try {
            const response = await fetch('/api/admin/create-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name })
            });

            const data = await response.json();

            if (!response.ok) {
                const error = new Error(data.error || 'Failed to create user.');
                error.code = response.status;
                throw error;
            }

            return data;
        } catch (error) {
            console.error("Auth Service Error [createAuthAccount]:", error);
            throw error;
        }
    }
};
