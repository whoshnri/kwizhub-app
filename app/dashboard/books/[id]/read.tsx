import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TextInput, Pressable, Alert, ActivityIndicator, Platform } from 'react-native';
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
    const [bookName, setBookName] = useState('Book');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [inputPage, setInputPage] = useState('');
    const pdfRef = useRef<any>(null);
    const router = useRouter();

    // prevent screen capture on mount, allow on unmount
    useEffect(() => {
        const prevent = async () => {
            await ScreenCapture.preventScreenCaptureAsync();
        };
        prevent();

        return () => {
            ScreenCapture.allowScreenCaptureAsync();
        };
    }, []);

    useEffect(() => {
        loadPdf();
    }, [id]);

    const loadPdf = async () => {
        try {
            console.log("Loading PDF for ID:", id);

            // Fetch book details to get the name
            const allBooks = await api.getBooks();
            const found = allBooks.find((b: any) => String(b.id) === String(id));

            if (found) {
                setBookName(found.name);
            } else {
                console.error("Book not found in API for ID:", id);
                Alert.alert('Error', 'Book not found');
                return;
            }

            const isDown = await isBookDownloaded(id as string);
            console.log("Is book downloaded?", isDown);
            let uri;
            if (isDown) {
                uri = getLocalPdfPath(id as string);
            } else {
                console.log("Book not downloaded, using remote path...");
                uri = found.pdfPath;
                if (uri && !uri.startsWith('http')) {
                    uri = `https://kwizhub.vercel.app${uri.startsWith('/') ? '' : '/'}${uri}`;
                }
            }

            if (!uri) {
                throw new Error("Invalid PDF URI");
            }

            console.log("PDF Source URI:", uri);
            setSource({ uri, cache: true });
        } catch (e) {
            console.error('Failed to load PDF:', e);
            Alert.alert('Error', 'Failed to load PDF data');
        }
    };

    const handlePageChange = (p: number, numberOfPages: number) => {
        setPage(p);
        setTotalPages(numberOfPages);
        setInputPage(p.toString());
    };

    const goToPage = (p: number) => {
        if (pdfRef.current && p >= 1 && p <= totalPages) {
            pdfRef.current.setPage(p);
        }
    };

    return (
        <View className="flex-1 bg-black">
            <Stack.Screen options={{ headerShown: true, title: `Read ${bookName}` }} />

            {source ? (
                <Pdf
                    ref={pdfRef}
                    source={source}
                    onLoadComplete={(numberOfPages) => {
                        console.log(`Number of pages: ${numberOfPages}`);
                        setTotalPages(numberOfPages);
                    }}
                    onPageChanged={handlePageChange}
                    onError={(error) => {
                        console.log(error);
                        Alert.alert('Error', 'Could not render PDF. Ensure you are using a Development Client build.');
                    }}
                    style={styles.pdf}
                    enablePaging={true}
                    horizontal={false}
                />
            ) : (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                    <Text className="text-white mt-4">Preparing PDF...</Text>
                </View>
            )}

            {/* Pagination Controls */}
            {totalPages > 0 && (
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
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    pdf: {
        flex: 1,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        backgroundColor: '#fff',
        color: '#000',
    }
});
