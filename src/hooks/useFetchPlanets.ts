import { useState, useEffect } from 'react';
import axios from 'axios';
import { PlanetData, AnalyzeResponse } from '@/types/exoplanet';

export const useFetchPlanets = (endpoint?: string, enabled: boolean = false) => {
  const [planets, setPlanets] = useState<PlanetData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlanets = async () => {
    if (!endpoint) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<AnalyzeResponse>(endpoint);
      setPlanets(response.data.planets || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch planets');
      console.error('Error fetching planets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled && endpoint) {
      fetchPlanets();
    }
  }, [endpoint, enabled]);

  return { planets, loading, error, refetch: fetchPlanets };
};
