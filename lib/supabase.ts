import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://krlkwcdhuhaojwkcayci.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtybGt3Y2RodWhhb2p3a2NheWNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MTQ4NjQsImV4cCI6MjA2MTM5MDg2NH0.jyHfLZwHaVGAhOFpcIwTE8bty1f9N6-xQ0n_1TrAWCA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})