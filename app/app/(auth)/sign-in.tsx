import { useEffect } from 'react';
import { useRouter } from 'expo-router';

// Sign-in is now part of the combined auth screen (sign-up.tsx).
// This redirect handles any deep links or old bookmarks to /sign-in.
export default function SignInRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/(auth)/sign-up'); }, []);
  return null;
}
