/**
 * OWM Clouds Layer for OpenHamClock Uses open Weather API
 * Added for USRadioguy.com - Real-time global cloud overlay
 */
// src/plugins/layers/OWMClouds.js
import React from 'react';

export const metadata = {
  id: 'owm-clouds',
  name: 'Global Clouds (OWM)',
  description: 'Real-time global cloud overlay from OpenWeatherMap',
  icon: '☁',
  defaultEnabled: false,
  defaultOpacity: 0.5,
  category: 'overlay'
};

export const useLayer = (map, enabled, opacity) => {
  const layerRef = React.useRef(null);

  React.useEffect(() => {
    if (!map) return;

    if (enabled) {
      // Use the API Key from your .env file
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || ''; 
      
      layerRef.current = L.tileLayer(`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${apiKey}`, {
        opacity: opacity,
        zIndex: 1000,
        attribution: '© OpenWeatherMap'
      });
      layerRef.current.addTo(map);
    } else {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    }

    return () => {
      if (layerRef.current && map) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [map, enabled, opacity]);
};
