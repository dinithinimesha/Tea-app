import { useState, useEffect } from 'react';
import { Alert, Text, ScrollView, TouchableOpacity, View } from 'react-native';
import { Button, Input } from '@rneui/themed';
import { supabase } from '@/lib/supabase';
import useSession from '@/hooks/useSession';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

// Define interface for session user
interface User {
  id: string;
  email?: string;
}

// Define interface for session
interface Session {
  user: User;
}

// Define interface for form data
interface FormData {
  fullName: string;
  username: string;
  phoneNumber: string;
  address: string;
}

// Define interface for profile data from Supabase
interface ProfileData {
  full_name: string | null;
  username: string | null;
  phoneNumber: string | null;
  phonenumber: string | number | null; // Include both formats for type safety
  address: string | null;
}

export default function EditUserAccount() {
  const { session } = useSession() as { session: Session | null };
  const navigation = useNavigation();

  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    username: '',
    phoneNumber: '',
    address: ''
  });

  useEffect(() => {
    // Only fetch profile if session exists and has user property
    // and only run once when session is available
    let isMounted = true;
    
    const fetchProfile = async () => {
      if (session?.user?.id && isMounted) {
        await getProfile();
      }
    };
    
    fetchProfile();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [session?.user?.id]); // Only depend on user ID specifically

  const handleChange = (field: keyof FormData, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Function to initialize profile if it doesn't exist
  const initializeProfile = async (userId: string): Promise<void> => {
    try {
      const initialProfile = {
        id: userId,
        full_name: '',
        username: '',
        phonenumber: '',
        address: '',
        created_at: new Date(),
        updated_at: new Date()
      };

      const { error } = await supabase.from('profiles').insert(initialProfile);
      
      if (error) {
        console.error('Error initializing profile:', error);
      } else {
        console.log('Profile initialized successfully');
      }
    } catch (error: any) {
      console.error('Failed to initialize profile:', error?.message);
    }
  };

  const getProfile = async (): Promise<void> => {
    try {
      setLoading(true);
      
      if (!session?.user?.id) {
        throw new Error('No user session found');
      }

      const userId = session.user.id;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, username, phonenumber, address')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        console.log('Fetched data:', data); // Debug log

        // Handle case where all data might be null
        setFormData({
          fullName: data.full_name ?? '',  // Use nullish coalescing operator
          username: data.username ?? '',
          phoneNumber: data.phonenumber ? String(data.phonenumber) : '',
          address: data.address ?? ''
        });
      } else {
        // If no data found, initialize a new profile
        await initializeProfile(userId);
        
        // Reset form data
        setFormData({
          fullName: '',
          username: '',
          phoneNumber: '',
          address: ''
        });
        console.log('No profile data found, initialized new profile');
      }
    } catch (error: any) { // Type annotation for error
      Alert.alert(
        'Error loading profile', 
        error?.message || 'An unknown error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (): Promise<void> => {
    try {
      setLoading(true);

      if (!session?.user?.id) {
        throw new Error('No user session found');
      }

      const userId = session.user.id;
      
      const updates = {
        id: userId,
        full_name: formData.fullName,
        username: formData.username,
        phonenumber: formData.phoneNumber,
        address: formData.address,
        updated_at: new Date()
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) { // Type annotation for error
      Alert.alert(
        'Error updating profile', 
        error?.message || 'An unknown error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 p-5 bg-gray-50">
      <View className="flex-row items-center justify-between mb-5">
        <TouchableOpacity
          className="p-2 rounded-full bg-gray-50"
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
        >
          <Icon name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        
        <Text className="text-2xl font-bold text-gray-900">
          Edit Your Profile
        </Text>
        
        <View style={{ width: 40 }}>
          {/* Empty view for spacing */}
        </View>
      </View>

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
        title={loading ? 'Updating...' : 'Update Profile'}
        onPress={updateProfile}
        disabled={loading}
        buttonStyle={{ backgroundColor: '#4F46E5', borderRadius: 8 }}
        containerStyle={{ marginTop: 16, marginBottom: 8 }}
      />
    </ScrollView>
  );
}