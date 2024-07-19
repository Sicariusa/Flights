import mapboxgl, { FullscreenControl, GeolocateControl, NavigationControl } from "mapbox-gl";
import { useEffect, useRef, useState } from "react";
import './../map.css'

interface IMapViewProps {
    center: mapboxgl.LngLat;
    zoom: number;
}
type MView = IMapViewProps

mapboxgl.accessToken= 'pk.eyJ1IjoiYWJkbzAiLCJhIjoiY2x5dDF4MjkwMGRtMTJqb3Q3MG81dGJpeCJ9.LRT9kWKN_D5kHOdH4o6qbA';

export const MapView = (props: MView)=>{
    const [mapInstance , setMapInstance] = useState<mapboxgl.Map>(); // useState hook to store the map instance
    
    const mapContainer = useRef<HTMLDivElement | null>(null); // useRef hook to store the map container reference
    useEffect(()=>{
        if(!mapInstance){
            if(!mapContainer.current) return;
        
        const map = new mapboxgl.Map({
            container: mapContainer.current || '',
            style: 'mapbox://styles/mapbox/dark-v10',
            center: props.center,
            zoom: props.zoom,
        });
        map.on('load', () =>{
            map.addControl(
                new NavigationControl({
                    showCompass: true,
                    showZoom: true
                }),
                'bottom-right'
            )
            map.addControl(
                new FullscreenControl(),
                'top-right'
            )
            map.addControl(
                new GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                trackUserLocation: true
            }),
            'bottom-right'
            )
        });
         setMapInstance(map);

     }
    }); // useEffect hook to run side effects in the component
    
    return (
        <div className="root">
            <div className="map-root" ref={mapContainer}></div>
        </div>
    )
}