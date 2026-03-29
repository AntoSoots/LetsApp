import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { ProductResult, SortCategory } from '../types';
import { Colors } from '../constants/colors';

interface Props {
  product: ProductResult;
  category: SortCategory;
  rank?: number;
}

const CATEGORY_CONFIG: Record<SortCategory, { color: string; emoji: string }> = {
  cheapest: { color: Colors.cheapest, emoji: '💚' },
  best: { color: Colors.best, emoji: '⭐' },
  fastest: { color: Colors.fastest, emoji: '⚡' },
};

export function ProductCard({ product, category, rank }: Props) {
  const { t } = useTranslation();

  const repBadge = {
    verified: { label: t('reputation.verified'), color: Colors.success },
    trusted: { label: t('reputation.trusted'), color: Colors.accent },
    unknown: { label: t('reputation.unknown'), color: Colors.warning },
  }[product.sellerReputation];

  const config = CATEGORY_CONFIG[category];

  const handleOpen = async () => {
    if (!product.isSecure) {
      Alert.alert(
        t('product.securityWarning'),
        t('product.securityWarningMessage'),
        [
          { text: t('product.cancel'), style: 'cancel' },
          { text: t('product.openAnyway'), onPress: () => void Linking.openURL(product.purchaseUrl) },
        ]
      );
      return;
    }
    const supported = await Linking.canOpenURL(product.purchaseUrl);
    if (supported) {
      await Linking.openURL(product.purchaseUrl);
    } else {
      Alert.alert(t('app.error'), t('app.cannotOpenLink'));
    }
  };

  const renderStars = (rating: number) => {
    const stars = Math.round(rating);
    return '★'.repeat(Math.min(stars, 5)) + '☆'.repeat(Math.max(0, 5 - stars));
  };

  const getDeliveryLabel = () => {
    if (product.estimatedDeliveryDays <= 3) return t('product.express');
    if (product.estimatedDeliveryDays <= 7) return t('product.fast');
    return t('product.standard');
  };

  return (
    <View style={styles.card}>
      {rank !== undefined && (
        <View style={[styles.rankBadge, { backgroundColor: config.color }]}>
          <Text style={styles.rankText}>#{rank + 1}</Text>
        </View>
      )}

      <View style={styles.header}>
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>🛍️</Text>
          </View>
        )}
        <View style={styles.headerInfo}>
          <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
          <Text style={styles.seller}>{product.seller}</Text>
          <View style={[styles.repBadge, { borderColor: repBadge.color }]}>
            <Text style={[styles.repText, { color: repBadge.color }]}>{repBadge.label}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={3}>{product.description}</Text>

      <View style={styles.ratingRow}>
        {product.rating > 0 ? (
          <>
            <Text style={[styles.stars, { color: Colors.warning }]}>{renderStars(product.rating)}</Text>
            <Text style={styles.ratingText}>
              {product.rating.toFixed(1)}
              {product.reviewCount > 0 ? ` (${product.reviewCount.toLocaleString()} ${t('product.reviews')})` : ''}
            </Text>
          </>
        ) : (
          <Text style={styles.ratingText}>{t('product.noRating')}</Text>
        )}
      </View>

      <View style={styles.priceRow}>
        <View>
          <Text style={[styles.totalPrice, { color: config.color }]}>
            €{product.totalCost.toFixed(2)}
          </Text>
          <Text style={styles.priceBreakdown}>
            + €{product.shippingCost.toFixed(2)} {t('product.shipping')}
          </Text>
        </View>
        <View style={styles.deliveryBadge}>
          <Text style={styles.deliveryText}>{getDeliveryLabel()}</Text>
          <Text style={styles.deliveryDays}>{product.estimatedDeliveryDays}d</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.buyButton, { backgroundColor: config.color }]}
        onPress={() => void handleOpen()}
        activeOpacity={0.8}
      >
        <Text style={styles.buyButtonText}>
          {product.isSecure ? `🔒 ${t('product.viewDeal')}` : `⚠️ ${t('product.viewDeal')}`}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  rankBadge: {
    position: 'absolute',
    top: -8,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    zIndex: 1,
  },
  rankText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  header: { flexDirection: 'row', gap: 12, marginBottom: 10, marginTop: 6 },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: Colors.surfaceLight,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: { fontSize: 32 },
  headerInfo: { flex: 1, gap: 4 },
  title: { color: Colors.text, fontSize: 15, fontWeight: '700', lineHeight: 20 },
  seller: { color: Colors.textMuted, fontSize: 13 },
  repBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  repText: { fontSize: 11, fontWeight: '600' },
  description: { color: Colors.textMuted, fontSize: 13, lineHeight: 18, marginBottom: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  stars: { fontSize: 14 },
  ratingText: { color: Colors.textMuted, fontSize: 13 },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  totalPrice: { fontSize: 22, fontWeight: '800' },
  priceBreakdown: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  deliveryBadge: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  deliveryText: { color: Colors.text, fontSize: 12, fontWeight: '600' },
  deliveryDays: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  buyButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
