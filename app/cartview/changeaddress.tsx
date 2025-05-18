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

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
  });

  useEffect(() => {
    if (session && session.user) {
      getProfile();
    }
  }, [session]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('address')
        .eq('id', session?.user?.id)
        .single();

      if (error) throw error;

      setFormData({
        address: data?.address || '',
      });
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
        address: formData.address,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;

      Alert.alert('Success', 'Address updated successfully!');
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'message' in error) {
        Alert.alert('Error updating address', (error as any).message || 'An unknown error occurred');
      } else {
        Alert.alert('Error updating address', 'An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 p-5 bg-gray-50">
      <Text className="mt-5 mb-5 text-2xl font-bold text-center text-gray-900">
        Change Shipping Address
      </Text>

      <TouchableOpacity
        className="p-2 mr-3 rounded-full bg-gray-50"
        onPress={() => navigation.goBack()}
        accessibilityLabel="Go back"
      >
        <Icon name="arrow-left" size={20} color="#333" />
      </TouchableOpacity>

      <Input
        label="Address"
        value={formData.address}
        onChangeText={(value) => handleChange('address', value)}
        placeholder="Enter your address"
        multiline
      />

      <Button
        title={loading ? 'Updating...' : 'Update Address'}
        onPress={updateProfile}
        disabled={loading}
        buttonStyle={{ backgroundColor: '#4F46E5', borderRadius: 8 }}
        containerStyle={{ marginTop: 16, marginBottom: 8 }}
      />
    </ScrollView>
  );
}