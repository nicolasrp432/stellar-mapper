# ExoPlanet Explorer 🪐

Interactive 3D visualization system for exoplanet detection and analysis. Built with React Three Fiber, TypeScript, and TailwindCSS.

## Features

- **3D Interactive Visualization**: Real-time orbital mechanics with camera controls
- **Dual Modes**:
  - **Didactic**: Educational mode with sliders to adjust planet parameters in real-time
  - **Professional**: Data-driven mode with CSV upload and backend integration
- **Rich UI**: Hover tooltips, detail panels, and light curve graphs
- **Responsive Design**: Works on desktop and mobile (WebGL supported)
- **Type-Safe**: Full TypeScript implementation

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:8080`

## Component Usage

### Basic Integration

```tsx
import ExoplanetSystem from '@/components/ExoplanetSystem';

function App() {
  return (
    <ExoplanetSystem
      mode="didactic"
      onPlanetSelect={(planet) => console.log(planet)}
    />
  );
}
```

### With Custom Data (Professional Mode)

```tsx
import ExoplanetSystem from '@/components/ExoplanetSystem';
import { PlanetData } from '@/types/exoplanet';

const customPlanets: PlanetData[] = [
  {
    id: 'kepler-22b',
    name: 'Kepler-22b',
    probability: 0.82,
    features: {
      radius: 2.4,
      period: 289.9,
      distance: 8.5,
      depth: 250,
      duration: 5.2,
      snr: 12.5,
    },
  },
];

function App() {
  return (
    <ExoplanetSystem
      mode="professional"
      planets={customPlanets}
      fetchEndpoint="/api/analyze"
    />
  );
}
```

## Props API

### `ExoplanetSystem`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'didactic' \| 'professional'` | `'didactic'` | Visualization mode |
| `planets` | `PlanetData[]` | `undefined` | External planet data (professional mode) |
| `fetchEndpoint` | `string` | `'/analyze'` | Backend endpoint for data fetching |
| `onPlanetSelect` | `(planet: PlanetData) => void` | `undefined` | Callback when planet is selected |
| `width` | `number \| string` | `'100%'` | Canvas width |
| `height` | `number \| string` | `'100vh'` | Canvas height |
| `showUI` | `boolean` | `true` | Show/hide UI panels |

## Data Format

### PlanetData Interface

```typescript
interface PlanetData {
  id: string;
  name?: string;
  probability?: number; // 0-1
  features: {
    depth?: number; // ppm
    duration?: number; // hours
    period: number; // days
    snr?: number;
    radius: number; // Earth radii
    distance: number; // AU
  };
}
```

### CSV Format (Professional Mode)

Required columns (configurable via mapping UI):

```csv
time,flux,period,radius,distance,depth,duration,snr
0,1.0,365,1.0,1.0,100,3.0,5.0
1,0.9999,730,1.5,2.0,200,4.0,7.0
```

### Backend API

#### POST `/analyze`

Request:
```json
{
  "arrayPosicion": [
    { "field": "period", "position": 2, "present": true },
    { "field": "radius", "position": 3, "present": true },
    { "field": "distance", "position": 4, "present": true }
  ],
  "csvData": [...]
}
```

Response:
```json
{
  "planets": [
    {
      "id": "planet-1",
      "name": "Kepler-22b",
      "probability": 0.82,
      "features": {
        "radius": 2.4,
        "period": 289.9,
        "distance": 8.5,
        "depth": 250,
        "duration": 5.2,
        "snr": 12.5
      }
    }
  ],
  "metadata": {
    "totalCandidates": 1,
    "processedAt": "2025-01-01T00:00:00Z"
  }
}
```

## Architecture

```
src/
├── components/
│   ├── ExoplanetSystem.tsx    # Main component
│   ├── Scene3D.tsx             # Three.js scene wrapper
│   ├── Star.tsx                # Central star with glow
│   ├── Planet.tsx              # Animated planet with orbit
│   ├── Tooltip2D.tsx           # Hover tooltips
│   ├── PlanetDetailPanel.tsx  # Side panel with details
│   ├── DidacticControls.tsx   # Parameter sliders
│   └── ProfessionalUploader.tsx # CSV upload & mapping
├── hooks/
│   ├── usePlanetsStore.tsx    # State management (Zustand)
│   └── useFetchPlanets.ts     # Data fetching
├── utils/
│   └── scale.ts                # Scene scaling & calculations
└── types/
    └── exoplanet.ts            # TypeScript interfaces
```

## Performance

- **Target**: 60 FPS with 5-10 planets on modern desktop
- **Optimization**:
  - Reused geometries and materials
  - LOD for distant planets (optional)
  - WebGL fallback for unsupported browsers
  - Automatic memory cleanup on unmount

## Controls

- **Mouse**: Click + drag to rotate camera
- **Scroll**: Zoom in/out
- **Hover**: Show planet tooltip
- **Click Planet**: Open detail panel
- **ESC**: Close detail panel

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- WebGL 2.0 required

## Tech Stack

- **Framework**: React 18 + Vite + TypeScript
- **3D**: Three.js + React Three Fiber + Drei
- **State**: Zustand
- **Styling**: TailwindCSS
- **Charts**: Plotly.js
- **Animation**: Framer Motion
- **HTTP**: Axios

## Development

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

## Testing

```bash
# Run tests
npm test

# Coverage
npm run test:coverage
```

## License

MIT

## Credits

Built for exoplanet detection research. Inspired by NASA's Exoplanet Archive and Kepler mission visualizations.
