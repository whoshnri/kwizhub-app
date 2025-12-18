import * as React from 'react';
import * as SecureStore from 'expo-secure-store';
import { useRouter, useSegments } from 'expo-router';

const SESSION_KEY = 'user_session_token';
const USER_KEY = 'user_details';

type User = {
    id: string;
    email: string;
    username: string;
    [key: string]: any;
} | null;

type AuthContextType = {
    signIn: (token: string, user: any) => Promise<void>;
    signOut: () => Promise<void>;
    user: User;
    isLoading: boolean;
};

const AuthContext = React.createContext<AuthContextType>({
    signIn: async () => { },
    signOut: async () => { },
    user: null,
    isLoading: true,
});

// This hook can be used to access the user info.
export function useAuth() {
    const value = React.useContext(AuthContext);
    if (process.env.NODE_ENV !== 'production') {
        if (!value) {
            throw new Error('useAuth must be wrapped in a <AuthProvider />');
        }
    }
    return value;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = React.useState<User>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const segments = useSegments();
    const router = useRouter();

    React.useEffect(() => {
        const restoreSession = async () => {
            try {
                const token = await SecureStore.getItemAsync(SESSION_KEY);
                const userStr = await SecureStore.getItemAsync(USER_KEY);

                if (token && userStr) {
                    setUser(JSON.parse(userStr));
                }
            } catch (e) {
                console.error('Failed to restore session', e);
            } finally {
                setIsLoading(false);
            }
        };

        restoreSession();
    }, []);

    const signIn = async (token: string, userData: any) => {
        try {
            await SecureStore.setItemAsync(SESSION_KEY, token);
            await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
            setUser(userData);
        } catch (error) {
            console.error("Sign in error", error);
        }
    };

    const signOut = async () => {
        try {
            await SecureStore.deleteItemAsync(SESSION_KEY);
            await SecureStore.deleteItemAsync(USER_KEY);
            setUser(null);
        } catch (error) {
            console.error("Sign out error", error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                signIn,
                signOut,
                user,
                isLoading,
            }}>
            {children}
        </AuthContext.Provider>
    );
}
