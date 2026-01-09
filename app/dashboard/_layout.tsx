import { Tabs, Redirect, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import { ActivityIndicator, View } from "react-native";


export default function RootLayout() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    if (!user) {
        return <Redirect href="/" />;
    }

    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarStyle: {
                backgroundColor: "var(--background)",
                height: 60,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                borderTopWidth: 0,
                borderColor: "#e5e7eb",
                paddingBottom: 10,
                paddingTop: 6,
                marginBottom: 10,
            },
            tabBarShowLabel: true,
            tabBarLabelStyle: {
                fontSize: 13,
                fontWeight: "bold",
            },
            tabBarActiveTintColor: "#2563eb", // Blue-600
            tabBarInactiveTintColor: "#9ca3af", // Gray-400
        }}>
            <Tabs.Screen name="books/index" options={{
                title: "My Library",
                tabBarLabel: "Library",
                headerShown: false,
                tabBarIcon: ({ color }) => (
                    <Ionicons name="library" color={color} size={24} />
                ),
            }} />
            <Tabs.Screen name="profile" options={{
                title: "Profile",
                tabBarIcon: ({ color }) => (
                    <Ionicons name="person" color={color} size={24} />
                )
            }} />

            <Tabs.Screen name="books/[id]/index" options={{
                href: null,
                headerShown: true,
                title: "Book Details",
                headerLeft: () => (
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color="#fff"
                        style={{ marginLeft: 16 }}
                        onPress={() => router.back()}
                    />
                ),
            }} />

            <Tabs.Screen name="books/[id]/read" options={{
                href: null,
                headerShown: true,
                title: "Book Read",
                headerLeft: () => (
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color="#fff"
                        style={{ marginLeft: 16 }}
                        onPress={() => router.back()}
                    />
                ),
            }} />

            {/* <Tabs.Screen name="read/[id]" options={{
                href: null,
                headerShown: true,
                title: "Read",
                headerLeft: () => (
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color="#fff"
                        style={{ marginLeft: 16 }}
                        onPress={() => router.back()}
                    />
                ),
            }} /> */}



        </Tabs>
    );
}
