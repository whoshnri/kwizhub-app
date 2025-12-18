import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import Pdf from 'react-native-pdf';
import * as ScreenCapture from 'expo-screen-capture';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { getLocalPdfPath, isBookDownloaded, downloadBookPdf } from '@/lib/storage';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

export default function ReadScreen() {
    const { id } = useLocalSearchParams();
    const [source, setSource] = useState<{ uri: string, cache: boolean } | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [inputPage, setInputPage] = useState('');
    const pdfRef = useRef<any>(null);
    const router = useRouter();

    // prevent screen capture on mount, allow on unmount
    useEffect(() => {
        const prevent = async () => {
            // Available on Android/iOS (latest expo)
            await ScreenCapture.preventScreenCaptureAsync();
        };
        prevent();

        // Hide tabs
        const parent = router.canGoBack() ? null : null; // checks don't work well with router here, need useNavigation
        // We need importing navigation

        return () => {
            ScreenCapture.allowScreenCaptureAsync();
        };
    }, []);

    useEffect(() => {
        loadPdf();
    }, [id]);

    const loadPdf = async () => {
        try {
            const isDown = await isBookDownloaded(id as string);
            let uri;
            if (isDown) {
                uri = getLocalPdfPath(id as string);
            } else {
                // If not downloaded, try to download or stream. 
                // Based on requirements we should fetch from secure source.
                // For now, let's assume we fetch details to get URL then download it if missing
                const allBooks = await api.getBooks();
                const found = allBooks.find((b: any) => b.id === id);
                if (found) {
                    uri = await downloadBookPdf(found.id, found.pdfPath);
                } else {
                    Alert.alert('Error', 'Book not found');
                    router.back();
                    return;
                }
            }
            setSource({ uri, cache: true });
        } catch (e) {
            Alert.alert('Error', 'Failed to load PDF');
            router.back();
        }
    };

    const handlePageChange = (page: number, numberOfPages: number) => {
        setPage(page);
        setTotalPages(numberOfPages);
        setInputPage(page.toString());
    };

    const goToPage = (p: number) => {
        if (pdfRef.current && p >= 1 && p <= totalPages) {
            pdfRef.current.setPage(p);
        }
    };

    return (
        <View className="flex-1 bg-black">
            <Stack.Screen options={{ headerShown: false }} />

            {source ? (
                <Pdf
                    ref={pdfRef}
                    source={source}
                    onLoadComplete={(numberOfPages, filePath) => {
                        console.log(`Number of pages: ${numberOfPages}`);
                        setTotalPages(numberOfPages);
                    }}
                    onPageChanged={handlePageChange}
                    onError={(error) => {
                        console.log(error);
                        Alert.alert('Error', 'Could not render PDF');
                    }}
                    onPressLink={(uri) => {
                        console.log(`Link pressed: ${uri}`);
                    }}
                    style={styles.pdf}
                    enablePaging={true}
                    horizontal={false}
                // Removed invalid props for type safety. ScreenCapture handles security.
                />
            ) : (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                    <Text className="text-white mt-4">Loading PDF...</Text>
                </View>
            )}

            {/* Pagination Controls */}
            <View className="absolute bottom-0 left-0 right-0 bg-background/90 p-4 flex-row items-center justify-between border-t border-border">
                <Button
                    variant="outline"
                    size="icon"
                    onPress={() => goToPage(page - 1)}
                    disabled={page <= 1}
                >
                    <Ionicons name="arrow-back" size={20} color={page <= 1 ? "gray" : "black"} />
                </Button>

                <View className="flex-row items-center gap-2">
                    <Text className="text-foreground">Page</Text>
                    <TextInput
                        className="bg-input text-foreground border border-border rounded px-2 py-1 w-12 text-center"
                        value={inputPage}
                        onChangeText={setInputPage}
                        keyboardType="numeric"
                        onSubmitEditing={() => {
                            const p = parseInt(inputPage);
                            if (!isNaN(p)) goToPage(p);
                        }}
                    />
                    <Text className="text-foreground">of {totalPages}</Text>
                </View>

                <Button
                    variant="outline"
                    size="icon"
                    onPress={() => goToPage(page + 1)}
                    disabled={page >= totalPages}
                >
                    <Ionicons name="arrow-forward" size={20} color={page >= totalPages ? "gray" : "black"} />
                </Button>
            </View>

            {/* Back Button Overlay */}
            <Pressable
                className="absolute top-12 left-4 bg-black/50 p-2 rounded-full"
                onPress={() => router.back()}
            >
                <Ionicons name="arrow-back" size={24} color="white" />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    pdf: {
        flex: 1,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        backgroundColor: '#000',
    }
});
