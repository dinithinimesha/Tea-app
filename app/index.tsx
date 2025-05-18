import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Auth from '../components/Auth'
import AdminDashboard from '@/components/AdminDashboard'
import UserDashboard from '../components/UserDashboard'
import { View, Text, ActivityIndicator } from 'react-native'
import { Session } from '@supabase/supabase-js'


type UserRole = 'user' | 'admin'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [userRole, setUserRole] = useState<UserRole>('user')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) getUserRole(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) getUserRole(session)
    })
  }, [])

  async function getUserRole(session: Session) {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user role:', error)
        setUserRole('user')
      }

      if (data) {
        setUserRole(data.role || 'user')
      }
    } catch (error) {
      console.error('Error getting user role:', error)
      setUserRole('user')
    } finally {
      setLoading(false)
    }
  }

  if (session && loading) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4 text-base text-gray-700">Loading your profile...</Text>
      </View>
    )
  }

  return (
    
    <View className="flex-1 bg-white">
      {session && session.user ? (
        userRole === 'admin' ? (
          <AdminDashboard session={session} />
        ) : (
          <UserDashboard session={session} />
        )
      ) : (
        <Auth />
      )}
    </View>
   
  )
}