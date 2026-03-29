import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import '../global.css';

export default function RootLayout() {
  return (
    <I18nextProvider i18n={i18n}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: '#0F172A' },
              headerTintColor: '#F1F5F9',
              headerTitleStyle: { fontWeight: '700' },
              contentStyle: { backgroundColor: '#0F172A' },
              animation: 'slide_from_right',
              headerRight: () => <LanguageSwitcher />,
            }}
          >
            <Stack.Screen
              name="index"
              options={{
                title: 'Tehop AI',
              }}
            />
            <Stack.Screen
              name="processing"
              options={{
                title: 'Töötlemine...',
                headerBackVisible: false,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="results"
              options={{ title: 'Tulemused' }}
            />
          </Stack>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </I18nextProvider>
  );
}
