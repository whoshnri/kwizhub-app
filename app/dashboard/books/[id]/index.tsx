import React from 'react';
import { View, ScrollView, ActivityIndicator, Alert, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';
import { isBookDownloaded, downloadBookPdf, deleteBookPdf } from '@/lib/storage';
import { Ionicons } from '@expo/vector-icons';

export default function BookDetailScreen() {
    const { id } = useLocalSearchParams();
    const [book, setBook] = React.useState<any>(null);
    const [isDownloaded, setIsDownloaded] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [processing, setProcessing] = React.useState(false);
    const router = useRouter();

    React.useEffect(() => {
        loadBook();
    }, [id]);

    async function loadBook() {
        try {
            const allBooks = await api.getBooks();
            const bookId = String(id);
            console.log("Books loaded:", allBooks.length, "Target ID:", bookId);

            const found = allBooks.find((b: any) => String(b.id) === bookId);

            if (!found) {
                console.warn("Book not found for ID:", id);
                Alert.alert("Error", "Book not found.");
                router.back();
                return;
            }

            setBook(found);

            // Check download status
            const downloaded = await isBookDownloaded(id as string);
            setIsDownloaded(downloaded);
        } catch (error) {
            console.error("Error loading book:", error);
            Alert.alert("Error", "Failed to load book details.");
        } finally {
            setLoading(false);
        }
    }

    async function handleDownload() {
        if (!book) return;
        setProcessing(true);
        try {
            // Ensure we have a full URL
            let pdfUrl = book.pdfPath;
            if (pdfUrl && !pdfUrl.startsWith('http')) {
                pdfUrl = `https://kwizhub.vercel.app${pdfUrl.startsWith('/') ? '' : '/'}${pdfUrl}`;
            }

            console.log("Downloading from:", pdfUrl);

            if (!pdfUrl) {
                throw new Error("Invalid PDF URL");
            }

            await downloadBookPdf(book.id, pdfUrl);
            setIsDownloaded(true);
            Alert.alert("Success", "Book downloaded securely.");
        } catch (error) {
            console.error("Download error:", error);
            Alert.alert("Error", "Failed to download book. Please check your connection.");
        } finally {
            setProcessing(false);
        }
    }

    async function handleRemove() {
        setProcessing(true);
        try {
            await deleteBookPdf(book.id);
            setIsDownloaded(false);
            Alert.alert("Removed", "Book removed from device.");
        } catch (error) {
            console.error(error);
        } finally {
            setProcessing(false);
        }
    }


    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (

        <ScrollView className="flex-1 bg-background p-6" >
            {book ? (
                <>
                    <View className="mb-8">
                        <View className='rounded-2xl mb-4 '>
                            <Ionicons name="book" size={32} color="#fff" />
                        </View>
                        <Text className="text-3xl font-bold text-foreground mb-2 leading-tight">{book.name}</Text>
                        <Text className="text-lg text-blue-600 font-semibold mb-6 uppercase tracking-wide">{book.course}</Text>

                        <View className="flex-col gap-3 bg-card p-4 rounded-xl border border-blue-100/10">
                            <View className="flex-row justify-between border-b border-blue-100/10 pb-2">
                                <Text className="text-muted-foreground text-xl font-semibold">Semester</Text>
                                <Text className="font-medium text-foreground text-xl">{book.semester}</Text>
                            </View>
                            <View className="flex-row justify-between">
                                <Text className="text-muted-foreground text-xl font-semibold">Price</Text>
                                <Text className="font-bold text-blue-600 text-xl">₦{book.price}</Text>
                            </View>
                        </View>
                    </View>

                    <View className="gap-3 mt-auto mb-10">
                        {isDownloaded ? (
                            <Pressable
                                onPress={() => router.push(`/dashboard/books/${book.id}/read`)}
                                className="flex-row items-center justify-center gap-3 bg-blue-600 p-4 rounded-xl active:opacity-90 shadow-sm shadow-blue-200"
                            >
                                <Ionicons name="book-outline" size={16} color="white" />
                                <Text className="text-white font-bold text-base">Read Now</Text>
                            </Pressable>
                        ) : (
                            <Pressable
                                onPress={handleDownload}
                                disabled={processing}
                                className={`flex-row items-center justify-center gap-3 p-4 rounded-xl active:opacity-90 shadow-sm ${processing ? 'bg-blue-400' : 'bg-blue-600 shadow-blue-200'}`}
                            >
                                {processing ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Ionicons name="download-outline" size={16} color="white" />
                                )}
                                <Text className="text-white font-bold text-base">
                                    {processing ? "Downloading..." : "Download to Read"}
                                </Text>
                            </Pressable>
                        )}

                        {isDownloaded && (
                            <Pressable
                                onPress={handleRemove}
                                disabled={processing}
                                className="flex-row items-center justify-center gap-3 bg-red-50 p-4 rounded-xl border border-red-100 active:bg-red-100"
                            >
                                <Ionicons name="trash-outline" size={20} color="#ef4444" />
                                <Text className="text-red-500 font-semibold text-base">Remove Download</Text>
                            </Pressable>
                        )}
                    </View>
                </>
            ) : (
                <View className="flex-1 items-center justify-center mt-20">
                    <Ionicons name="alert-circle-outline" size={48} color="#9ca3af" />
                    <Text className="text-muted-foreground mt-4 text-lg">Book details unavailable.</Text>
                </View>
            )
            }
        </ScrollView >
    );
}
