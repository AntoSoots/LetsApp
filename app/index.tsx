import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ImagePickerComponent } from '../components/ImagePickerComponent';
import { useNotifications } from '../hooks/useNotifications';
import { useProductSearch } from '../hooks/useProductSearch';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { SearchFilters, SourceOrigin } from '../types';
import { Colors } from '../constants/colors';

const EXAMPLE_HINTS = [
  'grill tongs for hot grates',
  'heat deflector plates for Kamado Bono Media grill',
  'heavy duty decorative stone garden edging',
];

const ORIGIN_CONFIG: Record<SourceOrigin, { label: string; flag: string }> = {
  estonia: { label: 'Eesti', flag: '🇪🇪' },
  europe: { label: 'Euroopa', flag: '🇪🇺' },
  global: { label: 'Globaalne', flag: '🌍' },
};

export default function HomeScreen() {
  const router = useRouter();
  const { pushToken } = useNotifications();
  const { submitSearch, isLoading, error } = useProductSearch();

  const [textInput, setTextInput] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const [filters, setFilters] = useState<SearchFilters>({
    origin: ['estonia', 'europe', 'global'],
  });

  const handleSubmit = async () => {
    if (!textInput.trim() && !imageUri) {
      Alert.alert('Input Required', 'Please enter a product description or upload an image.');
      return;
    }

    const requestId = await submitSearch(
      textInput.trim(),
      imageBase64,
      filters,
      pushToken
    );

    if (requestId) {
      router.push({
        pathname: '/processing',
        params: { requestId, query: textInput.trim() },
      });
    } else {
      Alert.alert('Error', error ?? 'Failed to start search. Please try again.');
    }
  };

  const toggleOrigin = (origin: SourceOrigin) => {
    setFilters((prev) => {
      const origins = prev.origin.includes(origin)
        ? prev.origin.filter((o) => o !== origin)
        : [...prev.origin, origin];
      return { ...prev, origin: origins.length === 0 ? [origin] : origins };
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <LoadingOverlay visible={isLoading} message="Preparing your search..." />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.heroEmoji}>🔍</Text>
            <Text style={styles.heroTitle}>Tehop AI Sourcing</Text>
            <Text style={styles.heroSubtitle}>
              Describe or photograph any product — AI finds the best deals across the web
            </Text>
          </View>

          {/* Image Picker */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Product Image (Optional)</Text>
            <ImagePickerComponent
              imageUri={imageUri}
              onImageSelected={(uri, base64) => {
                setImageUri(uri);
                setImageBase64(base64);
              }}
              onImageCleared={() => {
                setImageUri(null);
                setImageBase64(undefined);
              }}
            />
          </View>

          {/* Text Input */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Describe the Product *</Text>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={4}
              placeholder="e.g. heavy duty stainless steel grill tongs..."
              placeholderTextColor={Colors.textDim}
              value={textInput}
              onChangeText={setTextInput}
              textAlignVertical="top"
              returnKeyType="default"
            />
          </View>

          {/* Origin Filters */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Search Region</Text>
            <View style={styles.originRow}>
              {(['estonia', 'europe', 'global'] as SourceOrigin[]).map((origin) => {
                const config = ORIGIN_CONFIG[origin];
                const active = filters.origin.includes(origin);
                return (
                  <TouchableOpacity
                    key={origin}
                    style={[styles.originChip, active && styles.originChipActive]}
                    onPress={() => toggleOrigin(origin)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.flag}>{config.flag}</Text>
                    <Text style={[styles.originLabel, active && styles.originLabelActive]}>
                      {config.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Example hints */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Try an Example</Text>
            <View style={styles.hintsContainer}>
              {EXAMPLE_HINTS.map((hint) => (
                <TouchableOpacity
                  key={hint}
                  style={styles.hintChip}
                  onPress={() => setTextInput(hint)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.hintText} numberOfLines={1}>💡 {hint}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={() => void handleSubmit()}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <Text style={styles.submitIcon}>🚀</Text>
            <Text style={styles.submitText}>Source My Product</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              🔒 Secure · AI-Powered · Up to 5 min processing time
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  hero: { alignItems: 'center', paddingVertical: 24, marginBottom: 8 },
  heroEmoji: { fontSize: 48, marginBottom: 12 },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 15,
    padding: 14,
    minHeight: 100,
    lineHeight: 22,
  },
  originRow: { flexDirection: 'row', gap: 8 },
  originChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  originChipActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  flag: { fontSize: 18 },
  originLabel: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  originLabelActive: { color: Colors.primary },
  hintsContainer: { gap: 8 },
  hintChip: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hintText: { color: Colors.textMuted, fontSize: 13 },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitIcon: { fontSize: 20 },
  submitText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  footer: { alignItems: 'center', paddingBottom: 8 },
  footerText: { color: Colors.textDim, fontSize: 12 },
});
