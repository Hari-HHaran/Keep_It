// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Replace these strings with your actual keys from the Supabase Dashboard
const supabaseUrl = 'https://supabase.co'
const supabaseKey = 'your-anon-key'

// This creates the connection instance
export const supabase = createClient(supabaseUrl, supabaseKey)