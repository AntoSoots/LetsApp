import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProductCard } from '../components/ProductCard';
import { FilterBar } from '../components/FilterBar';
import { useProductSearch } from '../hooks/useProductSearch';
import { ProductResult, SortCategory, SourceOrigin } from '../types';
import { Colors } from '../constants/colors';

export default function ResultsScreen() {
  const router = useRouter();
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const { fetchResults, results, isLoading, error } = useProductSearch();

  const [activeCategory, setActiveCategory] = useState<SortCategory>('cheapest');
  const [activeOrigins, setActiveOrigins] = useState<SourceOrigin[]>([
    'estonia',
    'europe',
    'global',
  ]);

  useEffect(() => {
    if (requestId && !results) {
      void fetchResults(requestId);
    }
  }, [requestId, results, fetchResults]);

  const toggleOrigin = (origin: SourceOrigin) => {
    setActiveOrigins((prev) => {
      const next = prev.includes(origin)
        ? prev.filter((o) => o !== origin)
        : [...prev, origin];
      return next.length === 0 ? [origin] : next;
    });
  };

  const getFilteredProducts = (): ProductResult[] => {
    if (!results) return [];
    const sourceMap: Record<SortCategory, ProductResult[]> = {
      cheapest: results.cheapest,
      best: results.best,
      fastest: results.fastest,
    };
    return (sourceMap[activeCategory] ?? []).filter((p) =>
      activeOrigins.includes(p.origin)
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!results) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>📭</Text>
          <Text style={styles.errorTitle}>No Results</Text>
          <Text style={styles.errorText}>Could not find results for this request.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const filtered = getFilteredProducts();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {results.aiQuery ? (
        <View style={styles.queryBanner}>
          <Text style={styles.queryBannerLabel}>AI Query</Text>
          <Text style={styles.queryBannerText} numberOfLines={2}>
            "{results.aiQuery}"
          </Text>
        </View>
      ) : null}

      <FilterBar
        activeOrigins={activeOrigins}
        activeCategory={activeCategory}
        onToggleOrigin={toggleOrigin}
        onSelectCategory={setActiveCategory}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <ProductCard product={item} category={activeCategory} rank={index} />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your region filters or search term.
            </Text>
          </View>
        }
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.listHeaderText}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </Text>
            <TouchableOpacity onPress={() => router.push('/')}>
              <Text style={styles.newSearchText}>+ New Search</Text>
            </TouchableOpacity>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: { color: Colors.textMuted, fontSize: 16, marginTop: 16 },
  errorEmoji: { fontSize: 48, marginBottom: 16 },
  errorTitle: { fontSize: 22, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  errorText: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  queryBanner: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  queryBannerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  queryBannerText: { color: Colors.text, fontSize: 13 },
  listContent: { padding: 16, paddingBottom: 32 },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listHeaderText: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  newSearchText: { color: Colors.primary, fontSize: 13, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  emptyText: { color: Colors.textMuted, fontSize: 14, textAlign: 'center' },
});
