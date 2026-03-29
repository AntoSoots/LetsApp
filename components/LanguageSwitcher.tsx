import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/colors';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../i18n';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language as SupportedLanguage;

  const toggle = () => {
    const next: SupportedLanguage = current === 'en' ? 'et' : 'en';
    void i18n.changeLanguage(next);
  };

  return (
    <TouchableOpacity onPress={toggle} style={styles.container} activeOpacity={0.7}>
      {SUPPORTED_LANGUAGES.map((lang) => (
        <View
          key={lang}
          style={[styles.pill, current === lang && styles.pillActive]}
        >
          <Text style={[styles.label, current === lang && styles.labelActive]}>
            {lang.toUpperCase()}
          </Text>
        </View>
      ))}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginRight: 12,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pillActive: {
    backgroundColor: Colors.primary,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  labelActive: {
    color: Colors.white,
  },
});
