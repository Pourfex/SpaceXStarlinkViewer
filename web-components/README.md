# Angular Web Components

This directory contains 3 Angular web components that provide D3.js visualizations. These components are built as standalone JavaScript files that can be used in any web application.

## Components

1. **beeswarm-chart** - Displays a beeswarm plot of satellite altitudes
2. **launches-area-chart** - Shows the number of launches over time as an area chart
3. **velocity-histogram** - Displays a histogram of satellite velocities

## Building the Components

Each component is a standalone Angular project that uses Angular Elements to create a web component.

### Build All Components

From the project root:

```bash
./build-web-components.sh
```

This script will:
1. Build all 3 Angular web components
2. Copy the built JavaScript files to the React app's `public/` directory

### Build Individual Components

```bash
# Build beeswarm-chart
cd beeswarm-chart
npm run build

# Build launches-area-chart
cd launches-area-chart
npm run build

# Build velocity-histogram
cd velocity-histogram
npm run build
```

## Output Files

After building, each component generates a single `main.js` file in:
- `beeswarm-chart/dist/beeswarm-chart/browser/main.js`
- `launches-area-chart/dist/launches-area-chart/browser/main.js`
- `velocity-histogram/dist/velocity-histogram/browser/main.js`

These files are copied to the React app's `public/` directory with friendlier names:
- `beeswarm-chart.js`
- `launches-area-chart.js`
- `velocity-histogram.js`

## Using the Web Components

### In HTML

```html
<script src="/beeswarm-chart.js"></script>
<beeswarm-chart data='[...]'></beeswarm-chart>
```

### In React

```jsx
import React, { useEffect, useRef } from 'react'

function BeeswarmChart({ data }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current && data) {
      ref.current.data = JSON.stringify(data)
    }
  }, [data])

  return <beeswarm-chart ref={ref}></beeswarm-chart>
}
```

### In Any Framework

The web components can be used in any framework (Vue, Svelte, vanilla JS, etc.) by:
1. Loading the JavaScript file
2. Using the custom element tag
3. Passing data as a JSON string to the `data` attribute/property

## Component API

All three components have the same API:

### Input Property

- **data**: `string` (JSON array) - The Starlink satellite data

### Example Data Format

```json
[
  {
    "id": "5eed770f096e59000698560d",
    "spaceTrack": {
      "OBJECT_NAME": "STARLINK-30",
      "LAUNCH_DATE": "2019-05-24",
      "DECAY_DATE": "2020-10-13",
      "DECAYED": 1,
      ...
    },
    "height_km": 157.38,
    "velocity_kms": 7.7004,
    "version": "v0.9"
  },
  ...
]
```

## Technology Stack

- **Angular 19** - Framework
- **Angular Elements** - Web Components API
- **D3.js v7** - Data visualization
- **TypeScript** - Language
- **Shadow DOM** - Style encapsulation

## Benefits of Web Components

1. **Framework Agnostic**: Can be used in any JavaScript framework or vanilla JS
2. **Encapsulation**: Styles and logic are encapsulated (Shadow DOM)
3. **Reusability**: Build once, use anywhere
4. **Standard**: Based on web standards (Custom Elements, Shadow DOM)
5. **Performance**: Compiled to optimized JavaScript bundles

## Development

To work on a component:

```bash
cd beeswarm-chart  # or any component
npm start          # Starts Angular dev server
```

This will open the component in a test page where you can develop and see changes in real-time.

## File Structure

```
web-components/
├── beeswarm-chart/
│   ├── src/
│   │   ├── app/
│   │   │   └── app.ts          # Main component logic
│   │   └── main.ts              # Web component registration
│   ├── angular.json             # Angular configuration
│   └── package.json
├── launches-area-chart/
│   └── (same structure)
├── velocity-histogram/
│   └── (same structure)
└── README.md (this file)
```

