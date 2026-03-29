import { useState, useCallback } from 'react';
import { submitSearchRequest, getSearchResults, checkRequestStatus } from '../services/api';
import { savePendingRequest, clearPendingRequest, saveRecentSearch } from '../services/storage';
import { SearchResults, SearchFilters } from '../types';

export function useProductSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [aiQuery, setAiQuery] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'processing' | 'completed' | 'failed'>('idle');

  const submitSearch = useCallback(async (
    textInput: string,
    imageBase64: string | undefined,
    filters: SearchFilters,
    pushToken: string | undefined
  ) => {
    setIsLoading(true);
    setError(null);
    setStatus('submitting');

    const response = await submitSearchRequest(textInput, imageBase64, filters, pushToken);

    if (!response.success || !response.data) {
      setError(response.error ?? 'Failed to submit search');
      setStatus('failed');
      setIsLoading(false);
      return null;
    }

    const id = response.data.requestId;
    setRequestId(id);
    setStatus('processing');
    await savePendingRequest({
      id,
      textInput,
      status: 'processing',
      createdAt: new Date().toISOString(),
      filters,
    });
    setIsLoading(false);
    return id;
  }, []);

  const pollStatus = useCallback(async (id: string) => {
    const response = await checkRequestStatus(id);
    if (response.success && response.data) {
      if (response.data.aiQuery) {
        setAiQuery(response.data.aiQuery);
      }
      return response.data.status;
    }
    return 'unknown';
  }, []);

  const fetchResults = useCallback(async (id: string) => {
    setIsLoading(true);
    const response = await getSearchResults(id);
    if (response.success && response.data) {
      setResults(response.data);
      setStatus('completed');
      await saveRecentSearch(response.data);
      await clearPendingRequest();
    } else {
      setError(response.error ?? 'Failed to fetch results');
      setStatus('failed');
    }
    setIsLoading(false);
    return response.data;
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setRequestId(null);
    setAiQuery(null);
    setResults(null);
    setError(null);
    setStatus('idle');
  }, []);

  return {
    isLoading,
    requestId,
    aiQuery,
    results,
    error,
    status,
    submitSearch,
    pollStatus,
    fetchResults,
    reset,
  };
}
