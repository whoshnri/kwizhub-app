import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import * as React from 'react';
import { Pressable, TextInput, View, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { api } from '@/lib/api'; 
import { useAuth } from '@/lib/auth';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const passwordInputRef = React.useRef<TextInput>(null);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  const { signIn, user, isLoading } = useAuth();
  const [error, setError] = React.useState("")

  // Redirect if already logged in
  React.useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard/books');
    }
  }, [user, isLoading]);

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  async function onSubmit() {
    if (!email || !password) {
      setError("Please enter email and password")
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await api.login(email, password);
      await signIn(data.token, data.user);
      router.replace('/dashboard/books');
    } catch (e) {
      setError('Invalid credentials or network error');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 justify-center px-4  background-color">
      <Stack.Screen options={{ headerShown: false }} />
      <Card className="w-full mx-auto shadow-none border border-blue-100/10">
        <CardHeader className="pb-8">
          <View className="bg-blue-100 w-fit p-4 rounded-full mb-4 mx-auto">
            <Ionicons name="book" size={32} color="#2563eb" />
          </View>
          <CardTitle className="text-4xl font-bold text-center text-foreground">Welcome Back</CardTitle>
          <CardDescription className="text-center text-lg text-foreground">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-4">
            <View className="gap-2">
              <Label nativeID="email">Email</Label>
              <TextInput
                aria-labelledby="email"
                placeholder="m@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                onSubmitEditing={onEmailSubmitEditing}
                returnKeyType="next"
                className="bg-gray-50 border-gray-200 rounded-xl py-4 px-4 text-white bg-white/10 text-lg"
              />
            </View>
            <View className="gap-2">
              <Label nativeID="password">Password</Label>
              <TextInput
                ref={passwordInputRef}
                aria-labelledby="password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                returnKeyType="go"
                onSubmitEditing={onSubmit}
                placeholder="••••••••"
                className="bg-gray-50 border-gray-200 rounded-xl py-4 px-4 text-white bg-white/10 text-lg"
              />
            </View>
            {
              error && (
                <View className='bg-red-900 rounded text-white p-2 '>
                  <Text>{error}</Text>
                </View>
              )
            }
            <Pressable
              onPress={onSubmit}
              disabled={isSubmitting}
              className={`w-full h-12 flex-row justify-center items-center rounded-xl ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 active:bg-blue-700'}`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">Sign In</Text>
              )}
            </Pressable>
          </View>
        </CardContent>
      </Card>
    </SafeAreaView>
  );
}
