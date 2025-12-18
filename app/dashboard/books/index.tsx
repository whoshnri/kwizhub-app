import React from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, Pressable, RefreshControl } from 'react-native';
import { api } from '@/lib/api';
import { useRouter, Stack } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BooksScreen() {
  const [books, setBooks] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const router = useRouter();

  const fetchBooks = async () => {
    try {
      const data = await api.getBooks();
      setBooks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchBooks();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchBooks();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <Pressable onPress={() => router.push(`/dashboard/books/${item.id}` as any)}>
      <Card className="mb-4 border border-blue-100/10">
        <CardHeader className="flex-row items-center gap-3 pb-2 ">
          <View className="bg-blue-50 p-2 rounded-lg ">
            <Ionicons name="book" size={24} color="#2563eb" />
          </View>
          <View className="flex-1">
            <CardTitle className="text-xl font-bold">{item.name}</CardTitle>
            <CardDescription className="text-sm uppercase tracking-wider text-blue-500 font-semibold">{item.course}</CardDescription>
          </View>
        </CardHeader>
        <CardContent>
          <View className="flex-row justify-between items-center mt-2">
            <Text className="text-lg text-muted-foreground uppercase font-semibold">Semester: {item.semester}</Text>
            <Text className="font-bold text-lg text-blue-600">₦{item.price}</Text>
          </View>
        </CardContent>
      </Card>     
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="px-6 py-4">
        <Text className="text-3xl font-bold text-foreground ">My Library</Text>
        <Text className="text-muted-foreground mt-1">Access your purchased materials</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={books}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />
          }
          ListEmptyComponent={
            <View className="items-center justify-center mt-20 gap-4">
              <View className="bg-blue-50 p-4 rounded-full">
                <Ionicons name="library-outline" size={48} color="#2563eb" />
              </View>
              <Text className="text-center text-muted-foreground">No books found.</Text>
            </View>
          }
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        />
      )}
    </SafeAreaView>
  );
}
