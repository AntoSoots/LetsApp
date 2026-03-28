import AsyncStorage from '@react-native-async-storage/async-storage';
import { SearchRequest, SearchResults } from '../types';

const KEYS = {
  RECENT_SEARCHES: 'tehop_recent_searches',
  PUSH_TOKEN: 'tehop_push_token',
  PENDING_REQUEST: 'tehop_pending_request',
} as const;

export async function savePushToken(token: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.PUSH_TOKEN, token);
}

export async function getPushToken(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.PUSH_TOKEN);
}

export async function savePendingRequest(request: Partial<SearchRequest>): Promise<void> {
  await AsyncStorage.setItem(KEYS.PENDING_REQUEST, JSON.stringify(request));
}

export async function getPendingRequest(): Promise<Partial<SearchRequest> | null> {
  const raw = await AsyncStorage.getItem(KEYS.PENDING_REQUEST);
  return raw ? (JSON.parse(raw) as Partial<SearchRequest>) : null;
}

export async function clearPendingRequest(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.PENDING_REQUEST);
}

export async function saveRecentSearch(result: SearchResults): Promise<void> {
  const existing = await getRecentSearches();
  const updated = [result, ...existing].slice(0, 10);
  await AsyncStorage.setItem(KEYS.RECENT_SEARCHES, JSON.stringify(updated));
}

export async function getRecentSearches(): Promise<SearchResults[]> {
  const raw = await AsyncStorage.getItem(KEYS.RECENT_SEARCHES);
  return raw ? (JSON.parse(raw) as SearchResults[]) : [];
}
