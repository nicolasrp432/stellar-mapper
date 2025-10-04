export interface PlanetFeatures {
  depth?: number;
  duration?: number;
  period: number; // días -> velocidad orbital
  snr?: number;
  radius: number; // radios relativos
  distance: number; // unidades relativas al sistema
}

export interface PlanetData {
  id: string;
  name?: string;
  probability?: number; // 0-1
  features: PlanetFeatures;
}

export interface ExoplanetSystemProps {
  mode: 'didactic' | 'professional';
  planets?: PlanetData[];
  fetchEndpoint?: string;
  onPlanetSelect?: (planet: PlanetData) => void;
  width?: number | string;
  height?: number | string;
  showUI?: boolean;
}

export interface CSVMapping {
  field: string;
  position: number;
  present: boolean;
}

export interface AnalyzeResponse {
  planets: PlanetData[];
  metadata?: {
    totalCandidates: number;
    processedAt: string;
  };
}
