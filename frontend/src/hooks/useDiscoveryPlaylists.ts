import { useState, useEffect } from 'react';
import { getSpecializedPlaylists } from '../services/api';
import { SpecializedPlaylist } from '../types';
// import { DiscoveryAllPreviewsState } from '../pages/DiscoveryPage'; // We'll need to export this or move it
import { DiscoveryAllPreviewsState } from '../types';

export const isToday = (dateString: string | null): boolean => {
  if (!dateString) return false;
  const today = new Date().toISOString().split('T')[0];
  return dateString === today;
};

export const useDiscoveryPlaylists = () => {
  const [playlists, setPlaylists] = useState<SpecializedPlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // We need to initialize discoveryPreviewStates here or pass a setter from the component
  // For now, let's assume it will be managed by another hook or the component itself
  // and this hook will just set up the initial structure based on fetched playlists.

  useEffect(() => {
    const fetchPlaylists = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getSpecializedPlaylists();
        setPlaylists(data);
        
        // This part needs to be carefully considered.
        // If discoveryPreviewStates is managed by another hook,
        // this initialization logic might need to be passed in or signaled.
        // For now, let's assume the component/another hook will handle initializing its own state
        // perhaps by watching the `playlists` state from this hook.
        // Or, we pass a function to initialize it.

      } catch (err: any) {
        setError(err.message || "Failed to fetch specialized playlists. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  return { playlists, isLoading, error, setPlaylists }; // Returning setPlaylists for potential initial state setup
}; 