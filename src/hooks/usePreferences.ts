import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as preferencesApi from '../api/preferences';
import { useAuth } from '../store/AuthContext';

const PREFERENCES_QUERY_KEY = ['preferences'] as const;

export function usePreferences(enabled = true) {
  return useQuery({
    queryKey: PREFERENCES_QUERY_KEY,
    queryFn: preferencesApi.getPreferences,
    enabled,
  });
}

/** Submits the full preference set and refreshes the auth user (preferencesCompleted lives there). */
export function useSubmitPreferences() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();
  return useMutation({
    mutationFn: preferencesApi.submitPreferences,
    onSuccess: async (data) => {
      queryClient.setQueryData(PREFERENCES_QUERY_KEY, data);
      queryClient.invalidateQueries({ queryKey: ['recommended'] });
      queryClient.invalidateQueries({ queryKey: ['followedShops'] });
      await refreshUser();
    },
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();
  return useMutation({
    mutationFn: preferencesApi.updatePreferences,
    onSuccess: async (data) => {
      queryClient.setQueryData(PREFERENCES_QUERY_KEY, data);
      queryClient.invalidateQueries({ queryKey: ['recommended'] });
      queryClient.invalidateQueries({ queryKey: ['followedShops'] });
      await refreshUser();
    },
  });
}
