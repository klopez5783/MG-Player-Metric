import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xgcipaxsnxaaeplaxpeq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnY2lwYXhzbnhhYWVwbGF4cGVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MzgyMjgsImV4cCI6MjEwNTUxNDIyOH0.xEwmQp5BdY7v7gFGecz5SbPEi8T_Xd-4DBbE10qrXw8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

