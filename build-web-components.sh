#!/bin/bash

# Build mode: development (default) or production
MODE=${1:-development}

echo "Building all Angular web components in $MODE mode..."

# Build beeswarm-chart
echo "Building beeswarm-chart..."
cd web-components/beeswarm-chart && npm run build -- --configuration=$MODE && cd ../..

# Build launches-area-chart
echo "Building launches-area-chart..."
cd web-components/launches-area-chart && npm run build -- --configuration=$MODE && cd ../..

# Build velocity-histogram
echo "Building velocity-histogram..."
cd web-components/velocity-histogram && npm run build -- --configuration=$MODE && cd ../..

# Copy built files to public directory
echo "Copying web components to public directory..."
rm -f public/*.js
cp web-components/beeswarm-chart/dist/beeswarm-chart/browser/main.js public/beeswarm-chart.js
cp web-components/launches-area-chart/dist/launches-area-chart/browser/main.js public/launches-area-chart.js
cp web-components/velocity-histogram/dist/velocity-histogram/browser/main.js public/velocity-histogram.js

# Copy polyfills (zone.js) - only one copy needed as they're all the same
if [ -f web-components/beeswarm-chart/dist/beeswarm-chart/browser/polyfills.js ]; then
  cp web-components/beeswarm-chart/dist/beeswarm-chart/browser/polyfills.js public/polyfills.js
fi

echo "✅ All web components built and copied successfully in $MODE mode!"
echo ""
echo "File sizes:"
ls -lh public/*.js
echo ""
if [ "$MODE" = "development" ]; then
  echo "💡 For production builds (minified), run: ./build-web-components.sh production"
else
  echo "💡 For development builds (unminified), run: ./build-web-components.sh development"
fi
