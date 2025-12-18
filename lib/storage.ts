import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

const BOOKS_CACHE_KEY = 'user_books_cache';
const PDF_DIR = FileSystem.documentDirectory + 'books/';

// Ensure directory exists
export async function ensureDirExists() {
    const dirInfo = await FileSystem.getInfoAsync(PDF_DIR);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(PDF_DIR, { intermediates: true });
    }
}

// --- Data Caching (AsyncStorage) ---

export async function cacheBooksData(books: any[]) {
    try {
        await AsyncStorage.setItem(BOOKS_CACHE_KEY, JSON.stringify(books));
    } catch (e) {
        console.error('Failed to cache books data', e);
    }
}

export async function getCachedBooksData() {
    try {
        const json = await AsyncStorage.getItem(BOOKS_CACHE_KEY);
        return json ? JSON.parse(json) : [];
    } catch (e) {
        console.error('Failed to load cached books', e);
        return [];
    }
}

// --- File Caching (FileSystem) ---

export function getLocalPdfPath(bookId: string) {
    return `${PDF_DIR}${bookId}.pdf`;
}

export async function isBookDownloaded(bookId: string) {
    const path = getLocalPdfPath(bookId);
    const info = await FileSystem.getInfoAsync(path);
    return info.exists;
}

export async function downloadBookPdf(bookId: string, url: string) {
    await ensureDirExists();
    const fileUri = getLocalPdfPath(bookId);

    try {
        const downloadRes = await FileSystem.downloadAsync(url, fileUri);
        return downloadRes.uri;
    } catch (e) {
        console.error('Download failed', e);
        throw e;
    }
}

export async function deleteBookPdf(bookId: string) {
    const path = getLocalPdfPath(bookId);
    await FileSystem.deleteAsync(path, { idempotent: true });
}
