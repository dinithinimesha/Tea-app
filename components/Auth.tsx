import React, { useState } from 'react'
import { Alert, StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native'
import { supabase } from '@/lib/supabase'
import { Button, Input } from '@rneui/themed'
import { useNavigation } from '@react-navigation/native';
import { Link } from 'expo-router';


export default function EmailForm() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    setLoading(false)
  }

 /* async function signUpWithEmail() {
    setLoading(true)
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    if (!session) Alert.alert('Please check your inbox for email verification!')
    setLoading(false)
  }*/

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/Logo.png')} // adjust the path
        style={styles.image}
      />
      <Text className="mb-2 text-3xl font-bold text-center text-gray-800">Welcome Back</Text>
      <Text className="mb-2 text-2xl font-bold text-center text-gray-800">Sign In</Text>
      <View style={[styles.verticallySpaced, styles.mt20]}>
      <Text className="mb-1 text-base font-medium text-gray-600">Email</Text>
        <Input
          className="h-12 px-4 text-lg border border-gray-300 rounded-lg"
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
        />
      </View>
      <View style={styles.verticallySpaced}>
      <Text className="mb-1 text-base font-medium text-gray-600">Password</Text>
        <Input
          className="h-12 px-4 text-lg border border-gray-300 rounded-lg"
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
        />
      </View>

      <TouchableOpacity
            disabled={loading}
            onPress={signInWithEmail}
            className={`mt-5 placeholder:rounded-lg py-3 px-9 ${loading ? 'bg-green-300' : 'bg-green-600'} items-center mb-4`}
          >
            <Text className="text-lg font-semibold text-white">
              {loading ? "Signing ..." : "Sign In"}
            </Text>
          </TouchableOpacity>
      <View className="flex-row items-center justify-center mt-4">
            <Text className="text-base text-gray-500">Don't have an account?</Text>
            <Link href="/signup/signup" className="ml-1 text-base font-semibold text-green-600">
              Sign up
            </Link>
          </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 20,
    resizeMode: 'contain',
  },
})