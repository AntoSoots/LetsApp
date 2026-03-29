import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SourceOrigin, SortCategory } from '../types';
import { Colors } from '../constants/colors';

interface Props {
  activeOrigins: SourceOrigin[];
  activeCategory: SortCategory;
  onToggleOrigin: (origin: SourceOrigin) => void;
  onSelectCategory: (category: SortCategory) => void;
}

const ORIGINS: { value: SourceOrigin; flag: string }[] = [
  { value: 'estonia', flag: '🇪🇪' },
  { value: 'europe', flag: '🇪🇺' },
  { value: 'global', flag: '🌍' },
];

const CATEGORIES: { value: SortCategory; emoji: string; color: string }[] = [
  { value: 'cheapest', emoji: '💚', color: Colors.cheapest },
  { value: 'best', emoji: '⭐', color: Colors.best },
  { value: 'fastest', emoji: '⚡', color: Colors.fastest },
];

export function FilterBar({
  activeOrigins,
  activeCategory,
  onToggleOrigin,
  onSelectCategory,
}: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.value}
            style={[
              styles.categoryChip,
              activeCategory === cat.value && {
                backgroundColor: cat.color,
                borderColor: cat.color,
              },
            ]}
            onPress={() => onSelectCategory(cat.value)}
            activeOpacity={0.7}
          >
            <Text style={styles.chipEmoji}>{cat.emoji}</Text>
            <Text
              style={[
                styles.chipLabel,
                activeCategory === cat.value && styles.chipLabelActive,
              ]}
            >
              {t(`categories.${cat.value}`)}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={styles.divider} />
        {ORIGINS.map((origin) => (
          <TouchableOpacity
            key={origin.value}
            style={[
              styles.originChip,
              activeOrigins.includes(origin.value) && styles.originChipActive,
            ]}
            onPress={() => onToggleOrigin(origin.value)}
            activeOpacity={0.7}
          >
            <Text style={styles.flag}>{origin.flag}</Text>
            <Text
              style={[
                styles.originLabel,
                activeOrigins.includes(origin.value) && styles.originLabelActive,
              ]}
            >
              {t(`regions.${origin.value}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    alignItems: 'center',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceLight,
  },
  chipEmoji: { fontSize: 14 },
  chipLabel: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  chipLabelActive: { color: '#fff' },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  originChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceLight,
  },
  originChipActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  flag: { fontSize: 14 },
  originLabel: { color: Colors.textMuted, fontSize: 13, fontWeight: '500' },
  originLabelActive: { color: Colors.primary },
});
