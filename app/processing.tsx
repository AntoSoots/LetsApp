import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProductSearch } from '../hooks/useProductSearch';
import { Colors } from '../constants/colors';

const STEPS = [
  { emoji: '🔍', label: 'Analyzing your request...' },
  { emoji: '🤖', label: 'AI is generating search queries...' },
  { emoji: '🌐', label: 'Scouring the web for products...' },
  { emoji: '🔒', label: 'Verifying seller security...' },
  { emoji: '📊', label: 'Comparing prices and reviews...' },
  { emoji: '✅', label: 'Finalizing results...' },
];

export default function ProcessingScreen() {
  const router = useRouter();
  const { requestId, query } = useLocalSearchParams<{ requestId: string; query: string }>();
  const { pollStatus, fetchResults } = useProductSearch();

  const [currentStep, setCurrentStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [aiQuery, setAiQuery] = useState<string | null>(null);

  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  // Spin animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  // Pulse animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseValue, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseValue]);

  // Step progression — advance every 6s to stay in sync with ~8s poll cycles
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }, 6000);
    return () => clearInterval(stepInterval);
  }, []);

  // Elapsed timer
  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll for completion with exponential backoff (5s → 10s → 15s, cap at 20s)
  useEffect(() => {
    if (!requestId) return;
    let timeoutId: ReturnType<typeof setTimeout>;
    let delay = 5000;
    let active = true;

    const poll = async () => {
      if (!active) return;
      const status = await pollStatus(requestId);
      if (status === 'completed') {
        const results = await fetchResults(requestId);
        if (results) {
          router.replace({ pathname: '/results', params: { requestId } });
        }
        return;
      }
      delay = Math.min(delay + 5000, 20000);
      if (active) timeoutId = setTimeout(() => { void poll(); }, delay);
    };

    timeoutId = setTimeout(() => { void poll(); }, delay);
    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [requestId, pollStatus, fetchResults, router]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        {/* Animated logo */}
        <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseValue }] }]}>
          <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]} />
          <View style={styles.logoInner}>
            <Text style={styles.logoEmoji}>🤖</Text>
          </View>
        </Animated.View>

        <Text style={styles.title}>AI is Sourcing</Text>
        <Text style={styles.subtitle}>
          Finding the best deals for you.{'\n'}This may take up to 5 minutes.
        </Text>

        {query ? (
          <View style={styles.queryBox}>
            <Text style={styles.queryLabel}>Your Search</Text>
            <Text style={styles.queryText}>"{query}"</Text>
          </View>
        ) : null}

        {aiQuery ? (
          <View style={[styles.queryBox, styles.aiQueryBox]}>
            <Text style={styles.queryLabel}>AI-Generated Query</Text>
            <Text style={[styles.queryText, { color: Colors.primary }]}>"{aiQuery}"</Text>
          </View>
        ) : null}

        {/* Steps */}
        <View style={styles.stepsContainer}>
          {STEPS.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View
                style={[
                  styles.stepIndicator,
                  index < currentStep && styles.stepDone,
                  index === currentStep && styles.stepActive,
                ]}
              >
                {index < currentStep ? (
                  <Text style={styles.stepCheck}>✓</Text>
                ) : (
                  <Text style={styles.stepEmoji}>{step.emoji}</Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  index < currentStep && styles.stepLabelDone,
                  index === currentStep && styles.stepLabelActive,
                ]}
              >
                {step.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>Elapsed</Text>
          <Text style={styles.timerValue}>{formatTime(elapsed)}</Text>
        </View>

        <Text style={styles.notificationNote}>
          🔔 You'll receive a push notification when results are ready
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    position: 'relative',
  },
  spinner: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: Colors.primary,
    borderRightColor: Colors.accent,
  },
  logoInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  logoEmoji: { fontSize: 36 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  queryBox: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    width: '100%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  aiQueryBox: { borderColor: Colors.primary },
  queryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  queryText: { fontSize: 14, color: Colors.text, fontStyle: 'italic' },
  stepsContainer: { width: '100%', gap: 10, marginBottom: 24 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  stepActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  stepCheck: { color: '#fff', fontSize: 14, fontWeight: '800' },
  stepEmoji: { fontSize: 14 },
  stepLabel: { color: Colors.textDim, fontSize: 14 },
  stepLabelDone: { color: Colors.textMuted },
  stepLabelActive: { color: Colors.text, fontWeight: '600' },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timerLabel: { color: Colors.textMuted, fontSize: 13 },
  timerValue: { color: Colors.primary, fontSize: 16, fontWeight: '700' },
  notificationNote: { color: Colors.textDim, fontSize: 12, textAlign: 'center' },
});
