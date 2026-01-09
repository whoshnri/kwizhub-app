import { cacheBooksData, getCachedBooksData } from './storage';
import * as SecureStore from 'expo-secure-store';

const API_ORIGIN = 'https://kwizhub.vercel.app'; // Replace with actual API origin
const BASE_URL = `${API_ORIGIN}/api`;

async function getAuthHeaders() {
    const token = await SecureStore.getItemAsync('user_session_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
}

export const api = {
    login: async (email: string, password: string) => {
        try {
            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }
            console.log(response)
            const data = await response.json();
            await SecureStore.setItemAsync('user_session_token', data.token);
            // Expected data: { token, user: { ... } }
            return data;
        } catch (e) {
            console.error('API Login Error', e);
            // For development/demo, if API fails, we might want to throw or return mock
            // throw e;

            // MOCK FALLBACK FOR DEMO (Remove in production)
            if (email.includes('demo')) {
                return {
                    token: 'mock-jwt-token',
                    user: {
                        id: 'user-123',
                        email: email,
                        username: 'Demo User',
                    }
                }
            }
            throw e;
        }
    },

    getBooks: async () => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${BASE_URL}/books`, {
                method: 'GET',
                headers,
            });

            if (response.ok) {
                const data = await response.json();
                await cacheBooksData(data);
                return data;
            } else {
                throw new Error('Network response not ok');
            }
        } catch (e) {
            console.warn('Fetching books failed, falling back to cache', e);
            const cached = await getCachedBooksData();
            return cached || [];
        }
    }
};
