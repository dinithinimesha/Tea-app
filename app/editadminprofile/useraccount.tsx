// useraccount.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { supabase } from '@/lib/supabase';
import useSession from '@/hooks/useSession';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { Link } from 'expo-router';
import { Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  role?: string;
  phonenumber?: string;
  address?: string;
}

interface DetailItemProps {
  icon: string;
  label: string;
  value: string;
}

interface ProfileCardProps {
  profile: Profile;
  email?: string;
}

interface EmptyStateProps {
  message: string;
  onRetry?: () => void;
}

// Reusable DetailItem Component
const DetailItem = ({ icon, label, value }: DetailItemProps) => (
  <View className="flex-row items-start mb-3">
    <Text className="w-6 mr-3 text-lg text-center">{icon}</Text>
    <View className="flex-1">
      <Text className="text-sm text-gray-500">{label}</Text>
      <Text className="text-base text-gray-800">{value}</Text>
    </View>
  </View>
);

// ProfileCard Component
const ProfileCard = ({ profile, email }: ProfileCardProps) => {
  const avatarLetter = profile.username?.charAt(0).toUpperCase() ?? '?';
  return (
    <View className="mb-4 overflow-hidden bg-white shadow rounded-xl">
      <View className="flex-row items-center p-4">
        <View className="items-center justify-center w-12 h-12 bg-indigo-600 rounded-full">
          <Text className="text-xl font-bold text-white">{avatarLetter}</Text>
        </View>
        <View className="flex-1 ml-3">
          <Text className="text-lg font-semibold text-gray-900">{profile.full_name || 'Unnamed'}</Text>
          <Text className="text-gray-500">{profile.role || 'No Role'}</Text>
        </View>
      </View>
      <View className="h-px mx-4 bg-gray-200" />
      <View className="p-4">
        <DetailItem icon="👤" label="Username" value={profile.username || 'Not set'} />
        <DetailItem icon="👤" label="Fullname" value={profile.full_name || 'Not set'} />
        <DetailItem icon="📧" label="Email" value={email || 'No email'} />
        <DetailItem icon="📱" label="Phone" value={profile.phonenumber || 'Not provided'} />
        <DetailItem icon="🏠" label="Address" value={profile.address || 'Not provided'} />
      </View>
    </View>
  );
};

// EmptyState Component
const EmptyState = ({ message, onRetry }: EmptyStateProps) => (
  <View className="items-center justify-center flex-1 p-8">
    <Text className="mb-4 text-4xl">📋</Text>
    <Text className="text-base text-center text-gray-500">{message}</Text>
    {onRetry && (
      <TouchableOpacity className="p-2 mt-4 bg-indigo-600 rounded-full" onPress={onRetry}>
        <Text className="text-white">Retry</Text>
      </TouchableOpacity>
    )}
  </View>
);

// LoadingState Component
const LoadingState = () => (
  <View className="items-center justify-center flex-1 p-8">
    <ActivityIndicator size="large" color="#4F46E5" />
    <Text className="mt-3 text-base text-gray-500">Loading profile data...</Text>
  </View>
);

// ProfileList Component
const ProfileList = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session, loading: sessionLoading } = useSession() as { session: Session | null; loading: boolean };
  const navigation = useNavigation();

  const fetchProfiles = async () => {
    if (!session?.user?.id) {
      setError('No user session found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id);

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        console.error("Error fetching profiles:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session && !sessionLoading) {
      fetchProfiles();
    }
  }, [session, sessionLoading]);

  if (sessionLoading || loading) {
    return <LoadingState />;
  }

  if (error) {
    return <EmptyState message={`Error: ${error}`} onRetry={fetchProfiles} />;
  }

  if (profiles.length === 0) {
    return <EmptyState message="No profile information found" />;
  }

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerClassName="p-4 pb-8">
      <View>
        <Text className="mt-5 mb-4 text-2xl font-bold text-gray-900">Profile Information</Text>
        <TouchableOpacity
          className="p-2 mr-3 rounded-full bg-gray-50"
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
        >
          <Icon name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
      </View>
      
      {profiles.map((profile) => (
        <ProfileCard key={profile.id} profile={profile} email={session?.user?.email} />
      ))}

      <Link href="/editadminprofile/editadminprofile" className="flex items-center px-2 py-2 bg-green-400 rounded-xl">
        <Text className="justify-center font-medium text-black">Update Profile</Text>
      </Link>
    </ScrollView>
  );
};

export default ProfileList;