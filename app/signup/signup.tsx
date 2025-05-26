import React, { useState } from 'react';
import { Alert, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Input } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';

export default function EmailForm() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signUpWithEmail = async () => {
    // Add validation
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in both email and password');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    
    try {
      console.log('Attempting signup with:', email); // Debug log
      const { data, error } = await supabase.auth.signUp({ 
        email: email.trim(), 
        password 
      });

      console.log('Signup response:', { data, error }); // Debug log

      if (error) {
        console.error('Signup error:', error);
        Alert.alert('Signup Error', error.message);
      } else {
        console.log('Signup successful');
        Alert.alert(
          'Success', 
          'Signup complete!',
          [
            {
              text: 'OK',
              onPress: () => {
                setEmail('');
                setPassword('');
                 navigation.goBack();
                
              }
            }
          ]
        );
      }
    } catch (catchError) {
      console.error('Catch error:', catchError);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
   
      <Text className="mb-2 text-3xl font-bold text-center text-gray-800">Sign Up</Text>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Text className="mb-1 text-base font-medium text-gray-600">Email</Text>
        <Input
          className="h-12 px-4 text-lg border border-gray-300 rounded-lg"
          onChangeText={setEmail}
          value={email}
          placeholder="email@address.com"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Text className="mb-1 text-base font-medium text-gray-600">Password</Text>
        <Input
          className="h-12 px-4 text-lg border border-gray-300 rounded-lg"
          onChangeText={setPassword}
          value={password}
          secureTextEntry
          placeholder="Password"
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity
        disabled={loading}
        onPress={signUpWithEmail}
        className={`mt-5 rounded-lg py-3 px-9 ${loading ? 'bg-green-300' : 'bg-green-600'} items-center mb-4`}
      >
        <Text className="text-lg font-semibold text-white">
          {loading ? 'Signing Up...' : 'Sign Up'}
        </Text>
      </TouchableOpacity>

      <View className="flex-row items-center justify-center mt-4">
        <Text className="text-base text-gray-500">Do you already have an account?</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="ml-1 text-base font-semibold text-green-600">Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  verticallySpaced: {
    paddingVertical: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
});