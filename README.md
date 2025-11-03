# SpaceX Starlink Viewer 🚀

A modern React web application for exploring SpaceX's Starlink satellite constellation using real-time data from the SpaceX API. Features interactive D3.js visualizations built as reusable Angular web components.

## Features

- 📡 **Live Starlink Data**: Fetches real-time data from the SpaceX API
- 📄 **Paginated List View**: Browse through all Starlink satellites with smooth pagination (10 per page)
- 🔍 **Detailed Satellite Info**: Click any satellite to view comprehensive orbital and tracking data
- 📊 **D3.js Visualizations**: Three interactive charts built as Angular web components
  - **Launches Area Chart**: Visualize launch frequency over the years
  - **Velocity Histogram**: Distribution of satellite velocities
  - **Beeswarm Chart**: Altitude distribution of all satellites
- 🎯 **Web Components Architecture**: Framework-agnostic visualization components
- 🔄 **State Persistence**: Returns to your exact page position when navigating back from details
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Technologies Used

### Frontend Application
- **React 18** - Modern UI framework
- **React Router v6** - Client-side routing with state management
- **Vite** - Fast build tool and development server
- **SpaceX API v4** - Real-time satellite data

### Visualization Components (Web Components)
- **Angular 19** - Framework for building web components
- **Angular Elements** - Web Components API
- **D3.js v7** - Data visualization library
- **TypeScript** - Type-safe development
- **Shadow DOM** - Style encapsulation

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. The web components are pre-built and included. If you need to rebuild them:
```bash
./build-web-components.sh
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Data Displayed

### List View
Each satellite card shows:
- **Object Name**: Satellite identifier
- **Launch Date**: When the satellite was launched
- **Decay Date**: When the satellite decayed (if applicable)
- **Status**: Active or Decayed indicator
- **Height**: Current altitude in kilometers
- **Version**: Starlink satellite version

### Detail View
Comprehensive information including:
- General information (NORAD ID, version, country, etc.)
- Launch and status details
- Current position (height, latitude, longitude, velocity)
- Orbital elements (mean motion, eccentricity, inclination, etc.)
- Orbit characteristics (apoapsis, periapsis, etc.)
- Complete TLE (Two-Line Element) data set

### Visualizations
- Interactive D3.js charts (see details after)

## Architecture

This project uses a **hybrid architecture** combining React for the UI and Angular web components for visualizations:

- **React Application**: Handles routing, data fetching, and UI rendering
- **Angular Web Components**: Provides reusable, framework-agnostic D3.js visualizations

### Why This Architecture?

1. **Reusability**: Web components can be used in any framework or vanilla JS
2. **Encapsulation**: Each visualization is self-contained with its own styles
3. **Maintainability**: Visualizations are developed and tested independently
4. **Performance**: Optimized bundles with tree-shaking and minification

📖 **For detailed migration information, issues encountered, and solutions, see [WEB_COMPONENTS_MIGRATION.md](./WEB_COMPONENTS_MIGRATION.md)**

## Project Structure

```
EvalSpaceX/
├── src/
│   ├── components/
│   │   ├── StarlinkList.jsx       # Main list view with pagination
│   │   ├── StarlinkList.css
│   │   ├── StarlinkDetail.jsx     # Detailed satellite view
│   │   ├── StarlinkDetail.css
│   │   ├── BeeswarmChart.jsx      # React wrapper for web component
│   │   ├── LaunchesAreaChart.jsx  # React wrapper for web component
│   │   └── VelocityHistogram.jsx  # React wrapper for web component
│   ├── App.jsx                     # Main app with routing
│   ├── App.css
│   ├── main.jsx                    # Entry point
│   └── index.css
├── web-components/                 # Angular web components
│   ├── beeswarm-chart/            # Beeswarm visualization
│   ├── launches-area-chart/       # Launches area chart
│   ├── velocity-histogram/        # Velocity histogram
│   └── README.md                   # Web components documentation
├── public/                         # Built web component JS files
│   ├── beeswarm-chart.js
│   ├── launches-area-chart.js
│   └── velocity-histogram.js
├── index.html
├── vite.config.js
├── build-web-components.sh         # Script to rebuild web components
├── package.json
└── README.md
```

## API Reference

This application uses the SpaceX API v4:
- **Starlink Endpoint**: `https://api.spacexdata.com/v4/starlink`
- **Documentation**: [SpaceX API Docs](https://github.com/r-spacex/SpaceX-API)

## Features in Detail

### Pagination
- 10 satellites per page
- Smooth page transitions
- Page state preserved in URL
- Navigate to first, previous, next, or last page
- Visual indicator for current page

### Navigation
- Click any satellite card to view full details
- Back button returns to the exact page you were viewing
- URL-based routing for shareable links

### Visualizations (Web Components)
- **Beeswarm plot**: Shows altitude distribution patterns with interactive tooltips
- **Velocity Histogram**: Displays velocity distribution with statistics (mean/median)
- **Launches Area Chart**: Visualizes launch frequency trends over time
- All visualizations are built as Angular web components
- Framework-agnostic and reusable in any project
- Interactive tooltips on hover
- Responsive to window resize

## Working with Web Components

### Rebuilding Visualizations

If you make changes to any of the visualization components:

```bash
./build-web-components.sh
```

This will rebuild all 3 components and copy the updated JS files to the `public/` directory.

### Developing a Single Component

```bash
cd web-components/beeswarm-chart  # or any component
npm start
```

This starts the Angular development server where you can test the component in isolation.

### Using Web Components in Other Projects

The built JavaScript files in `public/` are standalone and can be used in any project:

**Vanilla JavaScript:**
```html
<script src="beeswarm-chart.js"></script>
<script>
  const chart = document.querySelector('beeswarm-chart');
  chart.data = JSON.stringify([/* your data */]);
</script>
<beeswarm-chart></beeswarm-chart>
```

**Vue:**
```vue
<template>
  <beeswarm-chart ref="chart"></beeswarm-chart>
</template>

<script>
export default {
  mounted() {
    this.$refs.chart.data = JSON.stringify(this.starlinkData);
  }
}
</script>
```

**Svelte:**
```svelte
<script>
  import { onMount } from 'svelte';
  let chartElement;
  
  onMount(() => {
    chartElement.data = JSON.stringify(data);
  });
</script>

<beeswarm-chart bind:this={chartElement}></beeswarm-chart>
```

See `web-components/README.md` for more details.

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

All browsers with Web Components support (Custom Elements v1, Shadow DOM v1).

## Contributing

Feel free to submit issues or pull requests!

## License

MIT License - feel free to use this project for learning or personal use.
