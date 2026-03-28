import axios from 'axios';
import { ApiResponse, SearchResults, SearchFilters } from '../types';
import Constants from 'expo-constants';

const API_URL =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  process.env.EXPO_PUBLIC_API_URL ??
  'https://your-app.vercel.app';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function submitSearchRequest(
  textInput: string,
  imageBase64: string | undefined,
  filters: SearchFilters,
  expoPushToken: string | undefined
): Promise<ApiResponse<{ requestId: string }>> {
  try {
    const response = await apiClient.post<ApiResponse<{ requestId: string }>>('/api/analyze', {
      textInput,
      imageBase64,
      filters,
      expoPushToken,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { success: false, error: error.response?.data?.error ?? error.message };
    }
    return { success: false, error: 'Network error. Please check your connection.' };
  }
}

export async function getSearchResults(
  requestId: string
): Promise<ApiResponse<SearchResults>> {
  try {
    const response = await apiClient.get<ApiResponse<SearchResults>>(
      `/api/search?requestId=${encodeURIComponent(requestId)}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { success: false, error: error.response?.data?.error ?? error.message };
    }
    return { success: false, error: 'Failed to fetch results.' };
  }
}

export async function checkRequestStatus(
  requestId: string
): Promise<ApiResponse<{ status: string; aiQuery?: string }>> {
  try {
    const response = await apiClient.get<ApiResponse<{ status: string; aiQuery?: string }>>(
      `/api/analyze?requestId=${encodeURIComponent(requestId)}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { success: false, error: error.response?.data?.error ?? error.message };
    }
    return { success: false, error: 'Failed to check status.' };
  }
}
