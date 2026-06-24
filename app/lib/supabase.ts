import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const supabase = createClient(
  'https://djdznsoospkpjmlurmng.supabase.co',
  'sb_publishable_xwStYX41Pyi9kwMCozyU8A_deDhN7UP',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      // On web, detect the access_token Supabase appends to the redirect URL
      // after email confirmation so the user is logged in automatically.
      detectSessionInUrl: Platform.OS === 'web',
    },
  }
);
