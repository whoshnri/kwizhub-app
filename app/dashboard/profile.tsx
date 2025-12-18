import React, { useState, useCallback } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/lib/api';

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const router = useRouter();

    const [bookCount, setBookCount] = useState<number | null>(null);

    useFocusEffect(
        useCallback(() => {
            const fetchStats = async () => {
                try {
                    const books = await api.getBooks();
                    if (Array.isArray(books)) {
                        setBookCount(books.length);
                    }
                } catch (e) {
                    console.error("Failed to fetch stats", e);
                }
            };
            fetchStats();
        }, [])
    );

    const handleLogout = () => {
        signOut();
        // The redirects are handled by layout or AuthProvider but explicit helps
    };

    if (!user) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center">
                <Text>Not logged in</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background px-6">
            <View className="items-center mt-10 mb-8">
                <View className="bg-blue-100 p-6 rounded-full mb-4">
                    <Ionicons name="person" size={64} color="#2563eb" />
                </View>
                <Text className="text-2xl font-bold text-foreground">{user.username}</Text>
                <Text className="text-muted-foreground">{user.email}</Text>
            </View>

            <View className="bg-card rounded-xl p-4 shadow-sm border border-blue-100/10 gap-4">
                <View className="flex-row justify-between items-center ">
                    <Text className="font-medium text-xl text-foreground">Books Owned</Text>
                    <Text className="text-white font-bold text-lg">
                        {user?.material_count}
                    </Text>
                </View>
                <View className="flex-row justify-between items-center ">
                    <Text className="font-medium text-xl text-foreground">Created at</Text>
                    <View className=" px-2  rounded">
                        <Text className="text-white text-lg font-bold">{new Date(user?.createdAt).toDateString()}</Text>
                    </View>
                </View>
            </View>

            <Pressable
                
                onPress={handleLogout}
                className="flex-row gap-2 mt-auto w-full border-red-200 bg-red-50 p-4 rounded-xl bg-red-950 text-white"
            >
                <Ionicons name="log-out-outline" size={20} color="#fff" />
                <Text className="font-medium">Sign Out</Text>
            </Pressable>
        </SafeAreaView>
    );
}
