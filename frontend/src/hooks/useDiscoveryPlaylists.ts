import { useState, useEffect } from 'react';
import { getSpecializedPlaylists } from '../services/api';
import { SpecializedPlaylist } from '../types';

export const isToday = (dateString: string | null): boolean => {
  if (!dateString) return false;
  const today = new Date().toISOString().split('T')[0];
  return dateString === today;
};

export const useDiscoveryPlaylists = () => {
  const [playlists, setPlaylists] = useState<SpecializedPlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaylists = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getSpecializedPlaylists();
        setPlaylists(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch specialized playlists. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  return { playlists, isLoading, error, setPlaylists };
}; 