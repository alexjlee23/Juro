import '../i18n';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider } from '../context/AuthContext';
import TermsGate, { TERMS_GATE_KEY } from '../components/ui/TermsGate';

export default function RootLayout() {
  // EULA at first launch on native (App Review 1.2): the app is unusable until
  // the user agrees. Web keeps the auth-screen gate instead, so the shareable
  // site stays friction-free for guests.
  const [gateAccepted, setGateAccepted] = useState<boolean | null>(
    Platform.OS === 'web' ? true : null
  );

  useEffect(() => {
    if (Platform.OS !== 'web') {
      AsyncStorage.getItem(TERMS_GATE_KEY).then(v => setGateAccepted(v === 'yes'));
    }
  }, []);

  if (gateAccepted === null) return null; // brief blank while reading storage

  if (!gateAccepted) {
    return (
      <>
        <StatusBar style="dark" />
        <TermsGate onAgree={() => setGateAccepted(true)} />
      </>
    );
  }

  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
