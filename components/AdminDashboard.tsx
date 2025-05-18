import React, { useState, useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Link } from 'expo-router';

// Define user role type
type UserRole = 'user' | 'admin';

// Profile interface
interface Profile {
  id: string;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export default function AdminDashboard({ session }: { session: Session }) {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      if (profilesError) throw profilesError;

      const { data: authUsers, error: authError } = await supabase
        .from('users')
        .select('id, email, created_at');
      if (authError) throw authError;

      // Check if profiles and authUsers exist before mapping
      if (profiles && authUsers) {
        const mergedUsers = profiles.map(profile => {
          const authUser = authUsers.find(user => user.id === profile.id);
          return {
            ...profile,
            email: authUser?.email || null,
            created_at: authUser?.created_at || profile.created_at,
          };
        });
        
        setUsers(mergedUsers);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error fetching users', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const showAlert = () => {
    Alert.alert('Sign Out', 'Do you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'OK', onPress: handleSignOut },
    ]);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error signing out', error.message);
      }
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      Alert.alert('Success', 'User role updated successfully');
      fetchUsers();
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error updating role', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 p-5 mt-2 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between mt-5 mb-4">
        <Link href="/editadminprofile/useraccount" asChild>
          <TouchableOpacity>
            <Icon name="user" size={24} color="black" />
          </TouchableOpacity>
        </Link>

        <Text className="text-2xl font-bold">Admin Dashboard</Text>

        <TouchableOpacity onPress={showAlert}>
          <Icon name="sign-out" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <Text className="mb-2 text-base text-gray-600">
        Welcome, {session?.user?.email || 'Admin'}
      </Text>

      <View className="self-start px-3 py-1 mb-5 bg-indigo-600 rounded-xl">
        <Text className="font-bold text-white">ADMIN</Text>
      </View>
      
      <View className="mt-5 space-y-6">
        <Link href="/manageproducts/productlist" asChild>
          <TouchableOpacity className="p-2 bg-green-400 rounded-xl">
            <Text className="font-bold text-center text-black">Manage Products</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/manageorders/orderlist" asChild>
          <TouchableOpacity className="p-2 mt-8 bg-green-400 rounded-xl">
            <Text className="font-bold text-center text-black">Manage Orders</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}