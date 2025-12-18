import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BooksScreen from '../app/dashboard/books/index';
import BookDetailScreen from '../app/dashboard/books/[id]/index';
import { useRouter } from 'expo-router';

// Mock the useRouter hook
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useLocalSearchParams: () => ({
    id: '1',
  }),
  Stack: {
    Screen: () => null,
  },
}));

// Mock the api and storage modules
jest.mock('@/lib/api', () => ({
  api: {
    getBooks: jest.fn(() => Promise.resolve([{ id: '1', name: 'Book 1' }])),
  },
}));
jest.mock('@/lib/storage', () => ({
  isBookDownloaded: jest.fn(() => Promise.resolve(true)),
}));

describe('Navigation', () => {
  it('navigates from book list to book details', async () => {
    const { findByText } = render(<BooksScreen />);
    const book = await findByText('Book 1');
    fireEvent.press(book);
    expect(useRouter().push).toHaveBeenCalledWith('/dashboard/books/1');
  });

  it('navigates from book details to read screen', async () => {
    const { findByText } = render(<BookDetailScreen />);
    const readButton = await findByText('Read Now');
    fireEvent.press(readButton);
    expect(useRouter().push).toHaveBeenCalledWith('./read');
  });
});
