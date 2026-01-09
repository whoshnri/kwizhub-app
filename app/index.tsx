import * as React from 'react';
import { 
  Platform, 
  Pressable, 
  TextInput, 
  View, 
  ActivityIndicator, 
  ScrollView, 
  KeyboardAvoidingView 
} from 'react-native';
import { Link, Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements'; // Recommended for offset calculation

import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { Text } from '@/components/ui/text';
import { Label } from '@/components/ui/label';

export default function LoginScreen() {
  const passwordInputRef = React.useRef<TextInput>(null);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  
  const router = useRouter();
  const { signIn, user, isLoading } = useAuth();
  const headerHeight = useHeaderHeight(); // Automatically gets header height for offset

  React.useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard/books');
    }
  }, [user, isLoading]);

  async function onSubmit() {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      const data = await api.login(email.trim().toLowerCase(), password);
      await signIn(data.token, data.user);
      router.replace('/dashboard/books');
    } catch (e: any) {
      setError('Invalid credentials or network error');
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        // If headerShown: false, offset is usually 0. If true, use headerHeight.
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          // flexGrow: 1 allows the content to fill the screen and center
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Spacer to push content to center/bottom if needed */}
          <View className="flex-1 justify-center py-10">
            
            {/* Header Section */}
            <View className="items-center mb-10">
              <View className="bg-blue-100 p-4 rounded-2xl mb-6">
                <Ionicons name="book" size={40} color="#2563eb" />
              </View>
              <Text className="text-3xl font-bold text-foreground mb-2 text-center">
                Welcome Back
              </Text>
              <Text className="text-muted-foreground text-center text-lg px-4">
                Sign in to access your materials
              </Text>
            </View>

            {/* Form Section */}
            <View className="gap-3">
              <View className="gap-2">
                <Label nativeID="email" className="ml-1">Email Address</Label>
                <TextInput
                  aria-labelledby="email"
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={email}
                  onChangeText={setEmail}
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                  returnKeyType="next"
                  className="bg-secondary/50 border border-border/20 rounded-2xl py-4 px-5 text-base text-foreground"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View className="gap-2">
                <Label nativeID="password" className="ml-1">Password</Label>
                <TextInput
                  ref={passwordInputRef}
                  aria-labelledby="password"
                  secureTextEntry
                  autoComplete="password"
                  value={password}
                  onChangeText={setPassword}
                  onSubmitEditing={onSubmit}
                  returnKeyType="go"
                  placeholder="••••••••"
                  className="bg-secondary/50 border border-border/20 rounded-2xl py-4 px-5 text-base text-foreground"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              {error ? (
                <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                  <Text className="text-red-600 text-center font-medium">{error}</Text>
                </View>
              ) : null}

              <Pressable
                onPress={onSubmit}
                disabled={isSubmitting}
                className={`w-full h-16 flex-row justify-center items-center rounded-2xl ${
                  isSubmitting ? 'bg-blue-400' : 'bg-blue-600 active:bg-blue-700'
                }`}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">Sign In</Text>
                )}
              </Pressable>

              <Pressable onPress={() => {}} className="mt-4">
                <Text className="text-center text-muted-foreground">
                  Don't have an account? <Link href="https://kwizhub.vercel.app/signup" className="text-blue-600 font-semibold">Sign Up</Link>
                </Text>
              </Pressable>
            </View>
          </View> 
          {/* End of centering View */}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}