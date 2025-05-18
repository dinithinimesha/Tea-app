import { useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  View,
  Alert,
  Text,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  TextInput,
} from 'react-native'
import { Link } from 'expo-router'
import { useNavigation } from '@react-navigation/native'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigation = useNavigation()

  const signInWithEmail = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error signing in', error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="justify-center flex-1"
      >
        <View className="items-center mb-8">
          <Image
            source={{ uri: "https://via.placeholder.com/150" }}
            className="w-32 h-32"
            resizeMode="contain"
          />
        </View>

        <View className="p-6 mx-4 bg-white shadow-md rounded-xl">
          <Text className="mb-2 text-3xl font-bold text-center text-gray-800">Welcome Back</Text>
          <Text className="mb-2 text-2xl font-bold text-center text-gray-800">Sign In</Text>

          <View className="mb-4">
            <Text className="mb-1 text-base font-medium text-gray-600">Email</Text>
            <TextInput
              className="h-12 px-4 text-lg border border-gray-300 rounded-lg"
              placeholder="email@address.com"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>

          <View className="mb-2">
            <Text className="mb-1 text-base font-medium text-gray-600">Password</Text>
            <TextInput
              className="h-12 px-4 text-lg border border-gray-300 rounded-lg"
              placeholder="Password"
              autoCapitalize="none"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            disabled={loading}
            onPress={signInWithEmail}
            className={`mt-5 placeholder:rounded-lg py-3 ${loading ? 'bg-green-300' : 'bg-green-600'} items-center mb-4`}
          >
            <Text className="text-lg font-semibold text-white">
              {loading ? "Signing In..." : "Sign In"}
            </Text>
          </TouchableOpacity>

          <View className="flex-row items-center justify-center mt-4">
            <Text className="text-base text-gray-500">Don't have an account?</Text>
            <Link href="/signup/signup" className="ml-1 text-base font-semibold text-green-600">
              Sign up
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
