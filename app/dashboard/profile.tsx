import React, { useState, useCallback } from 'react';
import { Pressable, ScrollView, View, ActivityIndicator, Modal, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/auth';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/lib/api';

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [bookCount, setBookCount] = useState<number | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);
    
    // --- Modal State ---
    const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);

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
                } finally {
                    setLoadingStats(false);
                }
            };
            fetchStats();
        }, [])
    );

    const confirmLogout = async () => {
        setLogoutModalVisible(false);
        await signOut();
        router.replace('/auth/login');
    };

    if (!user) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-background">
                <Text className="text-muted-foreground text-lg">Not logged in</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Header */}
                <View className="items-center mt-10 mb-10">
                    <View className="bg-blue-50 p-6 rounded-full mb-4">
                        <Ionicons name="person" size={54} color="#2563eb" />
                    </View>
                    <Text className="text-3xl font-bold text-foreground">{user.username}</Text>
                    <Text className="text-muted-foreground text-lg">{user.email}</Text>
                </View>

                {/* Account Details / Stats */}
                <View className="bg-secondary/30 rounded-3xl p-6 gap-6 border border-border/20">
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center gap-3">
                            <Ionicons name="book-outline" size={24} color="#2563eb" />
                            <Text className="font-semibold text-lg text-foreground">Books Owned</Text>
                        </View>
                        {loadingStats ? (
                            <ActivityIndicator size="small" color="#2563eb" />
                        ) : (
                            <Text className="text-foreground font-bold text-xl">
                                {bookCount ?? user?.material_count ?? 0}
                            </Text>
                        )}
                    </View>

                    <View className="h-[1px] bg-border/30 w-full" />

                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center gap-3">
                            <Ionicons name="calendar-outline" size={24} color="#2563eb" />
                            <Text className="font-semibold text-lg text-foreground">Member Since</Text>
                        </View>
                        <Text className="text-muted-foreground text-base">
                            {new Date(user?.createdAt).toLocaleDateString()}
                        </Text>
                    </View>
                </View>

                <View className="flex-1" />

                <Pressable
                    onPress={() => setLogoutModalVisible(true)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                    className="flex-row justify-center items-center gap-3 w-full bg-red-600 h-16 rounded-2xl mt-10"
                >
                    <Ionicons name="log-out-outline" size={24} color="#fff" />
                    <Text className="font-bold text-white text-lg">Sign Out</Text>
                </Pressable>

                {/* --- CUSTOM LOGOUT MODAL --- */}
                <Modal
                    visible={isLogoutModalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setLogoutModalVisible(false)}
                    className='border-0'
                >
                    <View className="flex-1 justify-center items-center bg-black/50 px-6 border-0">
                        <View className="bg-card w-full rounded-[32px] p-8 items-center shadow-xl border border-border/10">
                            <View className="bg-red-100 p-4 rounded-full mb-4">
                                <Ionicons name="alert-circle" size={32} color="#dc2626" />
                            </View>
                            
                            <Text className="text-2xl font-bold text-foreground mb-2">Sign Out</Text>
                            <Text className="text-muted-foreground text-center text-base mb-8">
                                Are you sure you want to sign out? You will need to log back in to access your books.
                            </Text>

                            <View className="flex-row gap-3 w-full">
                                <Pressable 
                                    onPress={() => setLogoutModalVisible(false)}
                                    className="flex-1 bg-secondary h-14 rounded-2xl items-center justify-center active:opacity-80"
                                >
                                    <Text className="font-bold text-secondary-foreground text-base">Cancel</Text>
                                </Pressable>
                                
                                <Pressable 
                                    onPress={confirmLogout}
                                    className="flex-1 bg-red-600 h-14 rounded-2xl items-center justify-center active:bg-red-700 shadow-sm shadow-red-400"
                                >
                                    <Text className="font-bold text-white text-base">Sign Out</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>

            </ScrollView>
        </SafeAreaView>
    );
}