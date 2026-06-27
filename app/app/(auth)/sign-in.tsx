import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function SignInRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/(auth)/sign-up?mode=signin' as any); }, []);
  return null;
}
