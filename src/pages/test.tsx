import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapView: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYWJkbzAiLCJhIjoiY2x5dDF4MjkwMGRtMTJqb3Q3MG81dGJpeCJ9.LRT9kWKN_D5kHOdH4o6qbA';

    if (mapContainerRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        zoom: 10,
        center: [-77.432, 25.0306]
      });

      mapRef.current.on('load', () => {
        mapRef.current?.loadImage(
            'https://docs.mapbox.com/mapbox-gl-js/assets/cat.png',
            (error, image) => {
              if (error) throw error;
              if (!image) return; // Check if image is not undefined
          
              mapRef.current?.addImage('cat', image);
          
              mapRef.current?.addSource('point', {
                type: 'geojson',
                data: {
                  type: 'FeatureCollection',
                  features: [
                    {
                      type: 'Feature',
                      properties: {}, // Ensure properties are present
                      geometry: {
                        type: 'Point',
                        coordinates: [-77.4144, 25.0759]
                      }
                    }
                  ]
                }
              });
          
              

            mapRef.current?.addLayer({
              id: 'points',
              type: 'symbol',
              source: 'point',
              layout: {
                'icon-image': 'cat',
                'icon-size': 0.25
              }
            });
          }
        );

        mapRef.current?.addControl(new mapboxgl.FullscreenControl(), 'top-right');
        mapRef.current?.addControl(
          new mapboxgl.GeolocateControl({
            positionOptions: {
              enableHighAccuracy: true
            },
            trackUserLocation: true
          }),
          'bottom-right'
        );
      });
    }

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  return (
    <div className="root">
      <div className="map-root" ref={mapContainerRef} style={{ height: '100%' }}></div>
    </div>
  );
};

export default MapView;
