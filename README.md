# SpaceX Starlink Viewer 🚀

React web application for exploring SpaceX's Starlink satellite constellation using real-time data from the SpaceX API.

## Features

- 📡 **Live Starlink Data**: Fetches real-time data from the SpaceX API
- 📄 **Paginated List View**: Browse through all Starlink satellites with smooth pagination (10 per page)
- 🔍 **Detailed Satellite Info**: Click any satellite to view comprehensive orbital and tracking data
- 📊 **D3.js Visualization**: Some visualisations for starlink objects.
- 🔄 **State Persistence**: Returns to your exact page position when navigating back from details

## Technologies Used

- **React 18** - Modern UI framework
- **React Router v6** - Client-side routing with state management
- **D3.js v7** - Data visualization for the beeswarm chart
- **Vite** - Fast build tool and development server
- **SpaceX API v4** - Real-time satellite data

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

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

## Project Structure

```
EvalSpaceX/
├── src/
│   ├── components/
│   │   ├── StarlinkList.jsx      # Main list view with pagination
│   │   ├── StarlinkList.css
│   │   ├── StarlinkDetail.jsx    # Detailed satellite view
│   │   ├── StarlinkDetail.css
│   │   ├── BeeswarmChart.jsx     # D3.js visualization
│   │   └── BeeswarmChart.css
│   ├── App.jsx                    # Main app with routing
│   ├── App.css
│   ├── main.jsx                   # Entry point
│   └── index.css
├── index.html
├── vite.config.js
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

### Visualization
- Beeswarm plot shows altitude distribution patterns
- Histogram to show starlink's velocity distribution
- Area chart for launches through the years

## Browser Support

- Chrome (recommended)
- Firefox

## License

MIT License - feel free to use this project for learning or personal use.
