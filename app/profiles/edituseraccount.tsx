import { useState, useEffect } from 'react';
import { Alert, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Button, Input } from '@rneui/themed';
import { supabase } from '@/lib/supabase';
import useSession from '@/hooks/useSession';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { Session } from '@supabase/supabase-js';

export default function EditUserAccount() {
  const { session } = useSession() as { session: Session | null };
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    phoneNumber: '',
    address: ''
  });

  useEffect(() => {
    if (session?.user) getProfile();
  }, [session]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, username, phonenumber, address')
        .eq('id', session?.user?.id)
        .single();

      if (error) throw error;

      if (data) {
        console.log('Fetched data:', data); // Debug log

        setFormData({
          fullName: data.full_name || '',
          username: data.username || '',
          phoneNumber: String(data.phonenumber || ''), // Ensure it's a string
          address: data.address || ''
        });
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'message' in error) {
        Alert.alert('Error loading profile', (error as any).message || 'An unknown error occurred');
      } else {
        Alert.alert('Error loading profile', 'An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setLoading(true);

      const updates = {
        id: session?.user?.id,
        full_name: formData.fullName,
        username: formData.username,
        phonenumber: formData.phoneNumber,
        address: formData.address,
        updated_at: new Date()
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'message' in error) {
        Alert.alert('Error updating profile', (error as any).message || 'An unknown error occurred');
      } else {
        Alert.alert('Error updating profile', 'An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 p-5 bg-gray-50">
      <Text className="mt-5 mb-5 text-2xl font-bold text-center text-gray-900">
        Edit Your Profile
      </Text>

      <TouchableOpacity
        className="p-2 mr-3 rounded-full bg-gray-50"
        onPress={() => navigation.goBack()}
        accessibilityLabel="Go back"
      >
        <Icon name="arrow-left" size={20} color="#333" />
      </TouchableOpacity>

      <Input
        label="Email"
        value={session?.user?.email || ''}
        disabled
      />

      <Input
        label="Full Name"
        value={formData.fullName}
        onChangeText={(value) => handleChange('fullName', value)}
        placeholder="Enter your full name"
      />

      <Input
        label="Username"
        value={formData.username}
        onChangeText={(value) => handleChange('username', value)}
        placeholder="Enter a username"
      />

      <Input
        label="Phone Number"
        value={formData.phoneNumber}
        onChangeText={(value) => handleChange('phoneNumber', value)}
        placeholder="Enter your phone number"
        keyboardType="phone-pad"
      />

      <Input
        label="Address"
        value={formData.address}
        onChangeText={(value) => handleChange('address', value)}
        placeholder="Enter your address"
        multiline
      />

      <Button
        title={loading ? 'Updating...' : 'Update'}
        onPress={updateProfile}
        disabled={loading}
        buttonStyle={{ backgroundColor: '#34D399', borderRadius: 8 }}
        containerStyle={{ marginTop: 16, marginBottom: 8 }}
      />
    </ScrollView>
  );
}