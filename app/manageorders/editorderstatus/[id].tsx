import { useState } from 'react';
import { Alert, Text, ScrollView, TouchableOpacity, View } from 'react-native';
import { Button } from '@rneui/themed';
import { supabase } from '@/lib/supabase';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { useLocalSearchParams } from 'expo-router';

export default function EditUserAccount() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [orderStatus, setOrderStatus] = useState('Delivered');
  const [loading, setLoading] = useState(false);

  const statuses = ['Delivered', 'Picked', 'Accepted'];

  const updateProfile = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .update({ order_status: orderStatus })
      .eq('id', id); // Replace with actual ID

    setLoading(false);

    if (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'Failed to update status.');
    } else {
      Alert.alert('Success', 'Order status updated successfully.');
    }
  };

  return (
    <ScrollView className="flex-1 p-5 bg-gray-50">
      <Text className="mt-5 mb-5 text-2xl font-bold text-center text-gray-900">
        Edit Status
      </Text>

      <TouchableOpacity
        className="p-2 mr-3 rounded-full bg-gray-50"
        onPress={() => navigation.goBack()}
        accessibilityLabel="Go back"
      >
        <Icon name="arrow-left" size={20} color="#333" />
      </TouchableOpacity>

      <View className="mb-5">
        <Text className="mb-2 text-base font-semibold text-gray-800">Select Order Status:</Text>
        {statuses.map((status) => (
          <TouchableOpacity
            key={status}
            onPress={() => setOrderStatus(status)}
            style={{
              padding: 10,
              borderRadius: 6,
              backgroundColor: orderStatus === status ? '#4F46E5' : '#E5E7EB',
              marginBottom: 8,
            }}
          >
            <Text style={{ color: orderStatus === status ? '#fff' : '#111' }}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        title={loading ? 'Updating...' : 'Update Status'}
        onPress={updateProfile}
        disabled={loading}
        buttonStyle={{ backgroundColor: '#4ade80', borderRadius: 8 }}
        titleStyle={{ color: '#000', fontWeight: 'bold' }}
        containerStyle={{ marginTop: 16, marginBottom: 8 }}
      />
    </ScrollView>
  );
}
