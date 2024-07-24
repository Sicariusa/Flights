import mapboxgl, { FullscreenControl, GeolocateControl, NavigationControl } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState } from 'react';
import './../map.css';
import flightLandPNG from './../resources/flight-land.png';
import flightIconPNG from './../resources/flight.png';
import flightTakeOffPNG from './../resources/flight-takeoff.png';
import { createFeatures, getMapGeoBounds, getSymbolLayout, getSymbolPaint } from '../helper/helper';
import { getStateVectors } from '../service/opensky-service';

interface IMapViewProps {
  center: mapboxgl.LngLat;
  zoom: number;
}

type MView = IMapViewProps;

mapboxgl.accessToken = 'pk.eyJ1IjoiYWJkbzAiLCJhIjoiY2x5dDF4MjkwMGRtMTJqb3Q3MG81dGJpeCJ9.LRT9kWKN_D5kHOdH4o6qbA';

export const MapView = (props: MView) => {
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map>();
  const mapContainer = useRef<HTMLDivElement | null>(null);

  const iconName = ['flight-icon', 'flight-land', 'flight-takeoff'];
  const iconImages = [flightIconPNG, flightLandPNG, flightTakeOffPNG];

  useEffect(() => {
    if (!mapInstance) {
      if (!mapContainer.current) return;

      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: props.center,
        zoom: props.zoom,
      });

      map.on('load', async () => {
        // Log to check if images are loaded
        iconImages.forEach((image, index) => {
          map.loadImage(image, (error, loadedImage) => {
            if (error) {
              console.error('Error loading image:', error);
              return;
            }
            if (loadedImage) {
              map.addImage(iconName[index], loadedImage);
              console.log(`Image '${iconName[index]}' added.`);
            }
          });
        });

        // Load state vectors and add features
        const bounds = getMapGeoBounds(map.getBounds() as mapboxgl.LngLatBounds);
        const stateVectors: any = await getStateVectors(bounds);

        if (!stateVectors || !stateVectors.states.length) {
          console.error('No state vectors found.');
          return;
        }

        const features = createFeatures(stateVectors);
        map.addSource('flight-source', {
          type: 'geojson',
          data: features,
        });

        // Check if features are being added
        console.log('Features added:', features);

        map.addLayer({
          id: 'flight-layer',
          type: 'symbol',
          source: 'flight-source',
          layout: {
            ...getSymbolLayout(map.getZoom()),
            'icon-image': ['match', ['get', 'flightType'], ...iconName.flatMap((name, i) => [i, name]), iconName[0]],
          },
          paint: getSymbolPaint() as {
            'icon-opacity'?: number;
            'text-color'?: string;
            'text-halo-width'?: number;
            'text-halo-color'?: string;
            'text-halo-blur'?: number;
          },
        });

        map.addControl(new NavigationControl({ showCompass: true, showZoom: true }), 'bottom-right');
        map.addControl(new FullscreenControl(), 'top-right');
        map.addControl(
          new GeolocateControl({
            positionOptions: {
              enableHighAccuracy: true,
            },
            trackUserLocation: true,
          }),
          'bottom-right'
        );
      });

      setMapInstance(map);
    }
  }, [mapInstance, props.center, props.zoom, iconImages]);

  return <div className="map-root" ref={mapContainer} style={{ height: '100%' }} />;
};
