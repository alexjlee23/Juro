import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabase = createClient(
  'https://djdznsoospkpjmlurmng.supabase.co',
  'sb_publishable_xwStYX41Pyi9kwMCozyU8A_deDhN7UP',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
